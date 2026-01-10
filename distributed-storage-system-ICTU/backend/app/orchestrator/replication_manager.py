from sqlalchemy.orm import Session
from typing import List
import logging

from app.database import models
from app.core.config import settings
from app.orchestrator.load_balancer import LoadBalancer
from app.workers.celery_app import celery_app

logger = logging.getLogger("orchestrator.replication")

class ReplicationManager:
    def __init__(self, db: Session):
        self.db = db
        self.lb = LoadBalancer(db)

    def ensure_redundancy(self, file_id: str):
        """
        Vérifie qu'un fichier a bien ses N copies.
        Appelé périodiquement ou après un upload.
        """
        file = self.db.query(models.File).filter_by(id=file_id).first()
        if not file: return

        # On suppose que file.node_id contient le primaire 
        # et file.replicas (JSON) contient les autres.
        # Ceci est une simplification du modèle pour l'exemple.
        
        current_replicas = self._get_active_replicas(file)
        required = settings.REPLICATION_FACTOR

        if len(current_replicas) < required:
            missing_count = required - len(current_replicas)
            logger.warning(f"File {file.name} is under-replicated. Missing {missing_count}.")
            
            # Trouver de nouveaux hôtes
            new_targets = self.lb.select_write_nodes(file.size, replicas=missing_count)
            
            # Lancer la copie en background (Async Worker)
            for target in new_targets:
                self._trigger_replication_task(file.id, source_node=current_replicas[0], target_node=target)

    def handle_node_failure(self, dead_node_id: str):
        """
        Appelé quand le HealthChecker déclare un node mort.
        Trouve tous les fichiers qui étaient sur ce node et lance la reconstruction ailleurs.
        """
        logger.info(f"🚑 Starting recovery for dead node: {dead_node_id}")
        
        # Trouver les fichiers dont ce node était le primaire ou une réplique
        affected_files = self.db.query(models.File).filter(
            models.File.node_id == dead_node_id # Simplifié
        ).all()
        
        for file in affected_files:
            self.ensure_redundancy(file.id)

    def _get_active_replicas(self, file: models.File) -> List[str]:
        # Logique pour vérifier qui est vivant via Redis
        return [file.node_id] # Stub

    def _trigger_replication_task(self, file_id: str, source_node: str, target_node: str):
        celery_app.send_task(
            "worker.replicate_block",
            args=[file_id, source_node, target_node]
        )