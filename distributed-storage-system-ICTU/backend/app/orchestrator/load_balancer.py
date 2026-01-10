import random
from typing import List
from sqlalchemy.orm import Session
from app.database import models
import logging

logger = logging.getLogger("orchestrator.load_balancer")

class LoadBalancer:
    def __init__(self, db: Session):
        self.db = db

    def select_write_nodes(self, file_size: int, replicas: int = 3) -> List[str]:
        """
        Sélectionne N nodes capables d'accueillir le fichier.
        Algorithme : Weighted Random (Pondéré par l'espace libre).
        """
        # 1. Filtrer les nodes qui ont assez d'espace + Buffer de sécurité (1GB)
        candidates = self.db.query(models.NodeStats).filter(
            models.NodeStats.disk_free > (file_size + 1024**3)
        ).all()

        if len(candidates) < replicas:
            logger.critical("Not enough storage nodes available!")
            raise Exception("Cluster Full or Not Enough Nodes")

        # 2. Algorithme de sélection pondérée
        # Plus un node a d'espace libre, plus il a de chances d'être choisi.
        # Cela équilibre naturellement le remplissage du cluster.
        
        weights = [node.disk_free for node in candidates]
        selected_nodes = random.choices(
            candidates, 
            weights=weights, 
            k=replicas
        )
        
        # S'assurer qu'on a des nodes distincts (random.choices peut prendre 2 fois le même)
        unique_ids = list(set([n.node_id for n in selected_nodes]))
        
        # Fallback si doublons : on complète avec d'autres
        if len(unique_ids) < replicas:
            remaining = [n.node_id for n in candidates if n.node_id not in unique_ids]
            unique_ids.extend(remaining[:replicas - len(unique_ids)])

        logger.info(f"⚖️  LoadBalancer selected: {unique_ids}")
        return unique_ids

    def select_read_node(self, replica_ids: List[str]) -> str:
        """
        Pour la lecture, on choisit le node avec le moins de latence réseau
        ou le moins de charge CPU active.
        (Ici simplifié par un choix aléatoire parmi les répliques vivantes)
        """
        # TODO: Ping rapide ou check Redis pour latence
        return random.choice(replica_ids)