from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import models

class RetentionPolicy:
    def __init__(self, db: Session):
        self.db = db

    def clean_trash(self, retention_days=30):
        """Supprime définitivement les fichiers > 30 jours dans la corbeille"""
        limit_date = datetime.utcnow() - timedelta(days=retention_days)
        
        files_to_delete = self.db.query(models.File).filter(
            models.File.is_trashed == True,
            models.File.trashed_at < limit_date
        ).all()
        
        for file in files_to_delete:
            # 1. Supprimer physiquement sur le Node (via gRPC)
            # NodeManager.delete(file.node_id, file.path)
            
            # 2. Supprimer de la DB
            self.db.delete(file)
            
        self.db.commit()
        return len(files_to_delete)