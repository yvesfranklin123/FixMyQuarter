import logging
from celery import shared_task
from app.database.db import SessionLocal
from app.storage_logic import healing, integrity

# Configuration du logging pour les workers
logger = logging.getLogger(__name__)

@shared_task(name="verify_integrity_task")
def verify_integrity_task(limit: int = 10):
    """
    Tâche périodique (Scrubbing).
    Vérifie un échantillon de chunks pour détecter la corruption (bit rot).
    """
    logger.info(f"Starting integrity check on {limit} random chunks...")
    db = SessionLocal()
    try:
        integrity.scrub_random_chunks(db, limit=limit)
        logger.info("Integrity check completed.")
    except Exception as e:
        logger.error(f"Integrity check failed: {e}")
    finally:
        db.close()

@shared_task(name="heal_file_task")
def heal_file_task(file_id: int):
    """
    Tâche déclenchée sur événement (ex: après détection d'un nœud mort).
    Répare un fichier en recréant les réplicas manquants.
    """
    logger.info(f"Starting healing process for file_id {file_id}...")
    db = SessionLocal()
    try:
        healing.repair_file(db, file_id)
        logger.info(f"File {file_id} healing check completed.")
    except Exception as e:
        logger.error(f"Healing failed for file {file_id}: {e}")
    finally:
        db.close()

@shared_task(name="rebalance_cluster_task")
def rebalance_cluster_task():
    """
    Tâche périodique.
    Déplace des chunks des nœuds pleins (>80%) vers des nœuds vides.
    (Note: Logique à implémenter dans storage_logic/rebalancer.py)
    """
    logger.info("Checking cluster balance...")
    # db = SessionLocal()
    # try:
    #     rebalancer.rebalance_nodes(db)
    # finally:
    #     db.close()
    logger.info("Rebalancing check completed (Not implemented yet).")