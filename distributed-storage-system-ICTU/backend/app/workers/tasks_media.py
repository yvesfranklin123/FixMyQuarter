import os
import subprocess
from PIL import Image
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.database.db import SessionLocal
from app.database import models
from app.node_code.storage_encryption import local_cipher # Pour lire les fichiers chiffrés

logger = get_task_logger(__name__)

# Helper pour avoir une DB session dans une tâche
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3, soft_time_limit=300)
def generate_thumbnail(self, file_id: str, file_path_on_node: str):
    """
    Génère une miniature JPG pour images et PDF.
    bind=True permet d'accéder à self.retry.
    """
    db = SessionLocal()
    try:
        file = db.query(models.File).get(file_id)
        if not file: return

        logger.info(f"🎨 Generating thumbnail for {file.name}")
        
        # 1. Lire et déchiffrer le fichier source (Simulation)
        # Dans la réalité, on téléchargerait le fichier depuis le Node
        # raw_data = download_from_node(file.node_id, file.path)
        # decrypted = local_cipher.decrypt_block(raw_data)
        
        # Pour l'exemple, on suppose qu'on a un accès local temporaire
        thumb_path = f"/tmp/thumb_{file_id}.jpg"

        # 2. Traitement selon le type
        if file.mime_type.startswith("image/"):
            with Image.open(file_path_on_node) as img:
                img.thumbnail((300, 300))
                img.save(thumb_path, "JPEG", quality=70)
                
        elif file.mime_type == "application/pdf":
            # Utilisation de poppler-utils via subprocess
            subprocess.run([
                "pdftoppm", "-jpeg", "-f", "1", "-l", "1", "-scale-to", "300", 
                file_path_on_node, f"/tmp/thumb_{file_id}"
            ], check=True)

        # 3. Sauvegarder la miniature (Upload vers stockage dédié)
        # save_thumbnail_to_storage(thumb_path)
        
        # 4. Mettre à jour la DB
        # file.has_thumbnail = True
        # db.commit()
        
        # Cleanup
        if os.path.exists(thumb_path): os.remove(thumb_path)

    except Exception as e:
        logger.error(f"Thumbnail failed: {e}")
        # Retry exponentiel (2s, 4s, 8s)
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
    finally:
        db.close()

@celery_app.task(queue="media", soft_time_limit=3600)
def transcode_video(file_id: str):
    """
    Transcode une vidéo brute en HLS/DASH (Streaming adaptatif).
    C'est une tâche très lourde.
    """
    logger.info(f"🎬 Starting Transcoding for {file_id}")
    # ... Logique ffmpeg complexe ...