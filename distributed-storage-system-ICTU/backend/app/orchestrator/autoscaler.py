import logging
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import models

# Simulation d'un SDK Cloud (ex: boto3 pour AWS ou kubernetes-client)
class CloudProviderAdapter:
    def scale_up(self, count: int):
        print(f"☁️  CLOUD API: Provisioning {count} new storage pods...")

class Autoscaler:
    def __init__(self, db: Session):
        self.db = db
        self.cloud = CloudProviderAdapter()
        self.threshold_percent = 80.0 # Seuil d'alerte à 80%

    def check_and_scale(self):
        """
        Vérifie l'utilisation globale du cluster.
        Si > 80%, commande de nouveaux nodes.
        """
        stats = self.db.query(
            func.sum(models.NodeStats.disk_total).label("total"),
            func.sum(models.NodeStats.disk_used).label("used")
        ).first()

        if not stats.total or stats.total == 0:
            return

        usage_percent = (stats.used / stats.total) * 100
        logger.info(f"📊 Cluster Usage: {usage_percent:.2f}%")

        if usage_percent > self.threshold_percent:
            logger.warning("⚠️  Cluster capacity critical. Initiating Auto-Scaling.")
            
            # Calcul de combien on doit ajouter pour repasser sous 60%
            current_total = stats.total
            target_total = stats.used / 0.60
            needed = target_total - current_total
            
            # Supposons des nodes de 1TB
            nodes_to_add = int(needed // (1024**4)) + 1
            
            # Limite de sécurité (ne pas ajouter 100 serveurs d'un coup)
            nodes_to_add = min(nodes_to_add, 5)
            
            self.cloud.scale_up(nodes_to_add)
            
        elif usage_percent < 20.0:
            # Scale Down (plus complexe, nécessite de vider les nodes avant)
            logger.info("Cluster under-utilized. Consider Scale Down (Not implemented).")