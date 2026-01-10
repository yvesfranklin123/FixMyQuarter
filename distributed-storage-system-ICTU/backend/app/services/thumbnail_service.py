from app.workers.celery_app import celery_app

class ThumbnailService:
    def generate_preview(self, file_path: str, mime_type: str, file_id: str):
        """
        Détermine le type de job à lancer en fonction du fichier.
        """
        task_name = None
        
        if mime_type.startswith("image/"):
            task_name = "worker.process_image"
        elif mime_type.startswith("video/"):
            task_name = "worker.process_video" # ffmpeg
        elif mime_type == "application/pdf":
            task_name = "worker.process_pdf"
            
        if task_name:
            celery_app.send_task(task_name, args=[file_id, file_path])