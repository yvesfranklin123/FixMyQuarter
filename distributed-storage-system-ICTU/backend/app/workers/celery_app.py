import os
from celery import Celery
from kombu import Queue, Exchange

from app.core.config import settings

# Initialisation de l'instance Celery
# On utilise Redis comme Broker (file d'attente) et Backend (stockage des résultats)
celery_app = Celery(
    "nexus_worker",
    broker=str(settings.REDIS_URL),
    backend=str(settings.REDIS_URL)
)

# --- CONFIGURATION AVANCÉE (Production Grade) ---
celery_app.conf.update(
    # Sécurité: On n'accepte que le JSON (pas de pickle qui peut exécuter du code malveillant)
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Robustesse: Si le worker meurt, la tâche revient dans la file (ACK tardif)
    task_acks_late=True,
    worker_prefetch_multiplier=1, # Un worker ne prend qu'une tâche lourde à la fois
    
    # Routing: Séparation des flux pour ne pas bloquer les tâches rapides
    task_queues=(
        Queue("default", Exchange("default"), routing_key="default"),
        Queue("media", Exchange("media"), routing_key="media"),    # Vidéos, Images
        Queue("security", Exchange("security"), routing_key="security"), # Antivirus
        Queue("system", Exchange("system"), routing_key="system"), # Maintenance, Réplication
    ),
    
    task_routes={
        "app.workers.tasks_media.*": {"queue": "media"},
        "app.workers.tasks_security.*": {"queue": "security"},
        "app.workers.tasks_replication.*": {"queue": "system"},
        "app.workers.tasks_maintenance.*": {"queue": "system"},
        "*": {"queue": "default"},
    },
)

# Auto-découverte des modules de tâches
celery_app.autodiscover_tasks([
    "app.workers.tasks_media",
    "app.workers.tasks_security",
    "app.workers.tasks_replication",
    "app.workers.tasks_maintenance",
])