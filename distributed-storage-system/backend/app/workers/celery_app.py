from celery import Celery
from app.config import settings

# Initialisation de l'instance Celery
# "worker" est le nom du module
celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.workers.tasks']  # Liste des modules contenant les tâches
)

# Configuration optionnelle pour la sérialisation et la timezone
celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
)

if __name__ == '__main__':
    celery_app.start()