import grpc
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import models
from app.core.config import settings
from app.protos import node_pb2, node_pb2_grpc  # Code généré par gRPC
import logging

logger = logging.getLogger("orchestrator.node_manager")

class NodeManager:
    """
    Singleton gérant les connexions actives aux Nodes de stockage.
    Maintient un pool de connexions gRPC pour éviter de les recréer à chaque requête.
    """
    _channels: Dict[str, grpc.Channel] = {}

    def __init__(self, db: Session):
        self.db = db

    def register_node(self, ip: str, port: int, capacity_bytes: int, region: str) -> models.NodeStats:
        """Enregistre un nouveau node physique dans le cluster."""
        node_id = f"node_{ip}_{port}"
        
        # Vérifie si existe déjà
        existing = self.db.query(models.NodeStats).filter_by(node_id=node_id).first()
        if existing:
            return existing

        new_node = models.NodeStats(
            node_id=node_id,
            disk_total=capacity_bytes,
            disk_free=capacity_bytes, # Au début, tout est vide
            disk_used=0,
            active_connections=0,
            recorded_at=datetime.utcnow()
        )
        self.db.add(new_node)
        self.db.commit()
        logger.info(f"✅ Node Registered: {node_id} in {region}")
        return new_node

    def get_node_client(self, node_id: str) -> Optional[node_pb2_grpc.StorageNodeStub]:
        """
        Retourne un client gRPC (Stub) pour parler au Node.
        Utilise un cache de channels.
        """
        # Parsing simple de l'ID (ex: node_192.168.1.5_50051)
        try:
            _, ip, port = node_id.split('_')
            target = f"{ip}:{port}"
        except ValueError:
            logger.error(f"Invalid Node ID format: {node_id}")
            return None

        if node_id not in self._channels:
            # Création du canal sécurisé ou insecure selon la config
            channel = grpc.aio.insecure_channel(target)
            self._channels[node_id] = channel
        
        return node_pb2_grpc.StorageNodeStub(self._channels[node_id])

    def update_stats(self, node_id: str, used: int, free: int, cpu: float):
        """Met à jour les métriques reçues via Heartbeat"""
        node = self.db.query(models.NodeStats).filter_by(node_id=node_id).first()
        if node:
            node.disk_used = used
            node.disk_free = free
            node.cpu_usage = cpu
            node.recorded_at = datetime.utcnow()
            self.db.commit()