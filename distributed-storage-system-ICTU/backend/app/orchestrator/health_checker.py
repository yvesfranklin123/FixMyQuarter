import asyncio
import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import models
from app.database.db import SessionLocal
from app.orchestrator.node_manager import NodeManager
from app.core.events import event_bus

logger = logging.getLogger("orchestrator.health")

class HealthChecker:
    def __init__(self):
        self.running = False

    async def start_monitoring(self, interval_seconds: int = 10):
        """Boucle infinie asynchrone qui ping les nodes"""
        self.running = True
        logger.info("💓 Health Checker Started")
        
        while self.running:
            await self._check_all_nodes()
            await asyncio.sleep(interval_seconds)

    async def _check_all_nodes(self):
        db: Session = SessionLocal()
        try:
            node_manager = NodeManager(db)
            # Récupérer tous les nodes connus
            # Note: Dans un vrai système, on utiliserait Redis pour cette liste rapide
            nodes = db.query(models.NodeStats).all()
            
            tasks = [self._ping_node(node, node_manager) for node in nodes]
            await asyncio.gather(*tasks)
            
        finally:
            db.close()

    async def _ping_node(self, node: models.NodeStats, manager: NodeManager):
        client = manager.get_node_client(node.node_id)
        if not client:
            return

        try:
            # Appel gRPC avec Timeout court (Fast Fail)
            # On suppose une méthode 'HealthCheck' dans le proto
            response = await asyncio.wait_for(client.HealthCheck(xml_pb2.Empty()), timeout=2.0)
            
            if response.status != "SERVING":
                await self._mark_node_offline(node.node_id)
            else:
                # Mise à jour de la date de dernière vue
                # (Idéalement fait dans Redis pour la perf, ici simplifié SQL)
                pass 

        except (asyncio.TimeoutError, Exception) as e:
            logger.warning(f"⚠️ Node {node.node_id} is unreachable: {e}")
            await self._mark_node_offline(node.node_id)

    async def _mark_node_offline(self, node_id: str):
        """Déclare un node mort et déclenche les réparations"""
        # Publie l'événement pour que le ReplicationManager réagisse
        await event_bus.publish("node_offline", {"node_id": node_id})