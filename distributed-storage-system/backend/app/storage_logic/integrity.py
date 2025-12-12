import hashlib
import logging
from sqlalchemy.orm import Session
from .replication import get_chunk_from_node
from ..database import models

logger = logging.getLogger("storage.integrity")

def verify_chunk_integrity(db: Session, chunk_id: str, node_id: str) -> bool:
    """
    Télécharge un chunk et vérifie son checksum.
    """
    chunk = db.query(models.FileChunk).filter(models.FileChunk.id == chunk_id).first()
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    
    if not chunk or not node:
        return False

    data = get_chunk_from_node(node.ip_address, 9999, chunk.id)
    if not data:
        return False
        
    calculated_hash = hashlib.sha256(data).hexdigest()
    
    if calculated_hash != chunk.checksum:
        logger.error(f"CORRUPTION DETECTED: Chunk {chunk.id} on Node {node.id}")
        return False
        
    return True

def scrub_random_chunks(db: Session, limit: int = 10):
    """
    Tâche de fond: vérifie aléatoirement des chunks pour détecter le 'bit rot'.
    """
    import random
    
    locations = db.query(models.ChunkLocation).all()
    if not locations:
        return

    sample = random.sample(locations, min(len(locations), limit))
    
    for loc in sample:
        is_valid = verify_chunk_integrity(db, loc.chunk_id, loc.node_id)
        if not is_valid:
            # Marquer comme corrompu dans une vraie implémentation
            # Ici on le supprime de la DB pour forcer une réparation ultérieure
            logger.warning(f"Removing corrupted replica of {loc.chunk_id} on {loc.node_id}")
            db.delete(loc)
            db.commit()