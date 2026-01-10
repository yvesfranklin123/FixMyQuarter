from celery.schedules import crontab
from datetime import datetime, timedelta
from app.workers.celery_app import celery_app
from app.database.db import SessionLocal
from app.database import models
from app.services.retention_policy import RetentionPolicy

# Configuration du planning (Celery Beat)
celery_app.conf.beat_schedule = {
    "clean-trash-every-night": {
        "task": "app.workers.tasks_maintenance.empty_trash_bin",
        "schedule": crontab(hour=3, minute=0), # Tous les jours à 3h00 du matin
    },
    "archive-logs-weekly": {
        "task": "app.workers.tasks_maintenance.archive_audit_logs",
        "schedule": crontab(day_of_week="sunday", hour=4, minute=0),
    },
}

@celery_app.task(queue="system")
def empty_trash_bin():
    """Supprime définitivement les fichiers vieux de 30 jours dans la corbeille"""
    db = SessionLocal()
    try:
        policy = RetentionPolicy(db)
        count = policy.clean_trash(retention_days=30)
        return f"Cleaned {count} files from trash."
    finally:
        db.close()

@celery_app.task(queue="system")
def archive_audit_logs():
    """Déplace les vieux logs vers un stockage froid (Cold Storage)"""
    db = SessionLocal()
    try:
        limit_date = datetime.utcnow() - timedelta(days=90)
        # Logique d'export CSV/JSON et upload vers S3 Glacier ou équivalent
        # Puis suppression de la table active
        pass
    finally:
        db.close()