import logging
from sqlalchemy.orm import Session
from .replication import get_chunk_from_node, send_chunk_to_node
from .placement import select_best_nodes
from ..database import models

logger = logging.getLogger("storage.healing")

def repair_file(db: Session, file_id: int):
    """
    Vérifie si un fichier a assez de réplicas. Sinon, lance la réparation.
    """
    db_file = db.query(models.File).filter(models.File.id == file_id).first()
    if not db_file:
        return

    # Pour chaque chunk du fichier
    for chunk in db_file.chunks:
        current_replicas = chunk.locations
        valid_replicas = [loc for loc in current_replicas if loc.node.status == "ONLINE"]
        
        target_replication = 2 # Configurable
        
        if len(valid_replicas) < target_replication:
            logger.info(f"Healing chunk {chunk.id} (Have {len(valid_replicas)}/{target_replication})")
            
            # 1. Récupérer la donnée depuis un survivant
            data = None
            for loc in valid_replicas:
                node = loc.node
                # Port par défaut 9999, ou stocké en DB
                data = get_chunk_from_node(node.ip_address, 9999, chunk.id)
                if data:
                    break
            
            if not data:
                logger.critical(f"DATA LOSS: Chunk {chunk.id} has no reachable replicas!")
                continue # Impossible de réparer

            # 2. Choisir de nouveaux nœuds
            exclude_ids = [loc.node_id for loc in current_replicas]
            new_nodes = select_best_nodes(
                db, 
                replication_factor=(target_replication - len(valid_replicas)), 
                exclude_node_ids=exclude_ids,
                required_size=chunk.size
            )
            
            # 3. Répliquer vers les nouveaux
            for node in new_nodes:
                if send_chunk_to_node(node.ip_address, 9999, chunk.id, data):
                    # Update DB
                    new_loc = models.ChunkLocation(
                        chunk_id=chunk.id,
                        node_id=node.id
                    )
                    db.add(new_loc)
                    logger.info(f"Replicated chunk {chunk.id} to node {node.id}")
                else:
                    logger.error(f"Failed to replicate to {node.id}")
            
            db.commit()