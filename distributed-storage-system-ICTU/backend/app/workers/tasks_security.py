from celery.utils.log import get_task_logger
from datetime import datetime
from app.workers.celery_app import celery_app
from app.database.db import SessionLocal
from app.database import models
from app.services.virus_scanner import VirusScanner

logger = get_task_logger(__name__)

@celery_app.task(bind=True, queue="security")
def scan_file_for_virus(self, file_id: str):
    """
    Scan un fichier avec ClamAV.
    Si infecté -> Quarantaine + Alerte Admin.
    """
    db = SessionLocal()
    scanner = VirusScanner()
    
    try:
        file = db.query(models.File).get(file_id)
        if not file: return

        # Création entrée scan
        scan_record = models.VirusScan(
            file_id=file_id, status="pending", scan_engine="ClamAV"
        )
        db.add(scan_record)
        db.commit()

        # Simulation récupération flux
        # file_stream = get_file_stream(file)
        
        # Scan (Mocké ici pour l'exemple, utiliser VirusScanner.scan_stream)
        is_clean = True # scanner.scan_stream(file_stream)
        
        if is_clean:
            scan_record.status = "clean"
            scan_record.scanned_at = datetime.utcnow()
        else:
            scan_record.status = "infected"
            scan_record.virus_name = "Detected-Signature-X"
            logger.critical(f"☣️ VIRUS FOUND in file {file_id}")
            
            # Action: Isoler le fichier (Soft Delete + Flag)
            file.is_trashed = True
            # On pourrait notifier l'admin via email ici
            
        db.commit()

    except Exception as e:
        logger.error(f"Scan error: {e}")
        db.rollback()
        raise self.retry(exc=e, countdown=30)
    finally:
        db.close()