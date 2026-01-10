import logging
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.database import models
from app.core.events import event_bus
from app.schemas import file as file_schema

logger = logging.getLogger(__name__)

class FileManager:
    def __init__(self, db: Session):
        self.db = db

    async def create_file_metadata(
        self, 
        metadata: file_schema.FileCreate, 
        owner_id: int, 
        size: int, 
        node_id: str,
        mime_type: str = "application/octet-stream" # Ajout de l'argument mime_type
    ) -> models.File:
        """
        Crée l'entrée DB et met à jour le quota de l'utilisateur Onyx.
        """
        # 1. Extraction de l'extension
        extension = metadata.name.split('.')[-1] if '.' in metadata.name else ''

        # 2. Création de l'objet File
        db_file = models.File(
            name=metadata.name,
            size=size,
            extension=extension.lower(),
            mime_type=mime_type,
            node_id=node_id,
            owner_id=owner_id,
            folder_id=metadata.folder_id,
            is_encrypted=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(db_file)
        
        # 3. Mise à jour atomique du quota utilisateur
        user = self.db.query(models.User).filter(models.User.id == owner_id).first()
        if user:
            # On s'assure que used_storage n'est pas None avant l'addition
            current_used = user.used_storage or 0
            user.used_storage = current_used + size
        
        try:
            self.db.commit()
            self.db.refresh(db_file)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Erreur lors de la création des métadonnées Nexus: {str(e)}")
            raise

        # 4. Publication d'événement (ex: pour générer la miniature)
        try:
            await event_bus.publish("file_uploaded", {"file_id": db_file.id})
        except Exception as e:
            logger.warning(f"Événement post-upload non publié: {str(e)}")
        
        return db_file

    def move_to_trash(self, file_id: str, user_id: int):
        """Désactivation logique du fragment (Soft Delete)"""
        file = self.db.query(models.File).filter_by(id=file_id, owner_id=user_id).first()
        if file:
            # On vérifie si ton modèle utilise is_trashed ou is_deleted
            if hasattr(file, 'is_deleted'):
                file.is_deleted = True
            elif hasattr(file, 'is_trashed'):
                file.is_trashed = True
                
            file.updated_at = datetime.utcnow()
            self.db.commit()
            return True
        return False

    def restore_from_trash(self, file_id: str, user_id: int):
        """Restauration du fragment sur le réseau"""
        file = self.db.query(models.File).filter_by(id=file_id, owner_id=user_id).first()
        if file:
            if hasattr(file, 'is_deleted'): file.is_deleted = False
            if hasattr(file, 'is_trashed'): file.is_trashed = False
            
            file.updated_at = datetime.utcnow()
            self.db.commit()
            return True
        return False

    def get_file_tree(self, folder_id: Optional[str] = None, owner_id: int = None):
        """Récupère le contenu d'un secteur spécifique"""
        return self.db.query(models.File).filter_by(
            owner_id=owner_id, 
            folder_id=folder_id
        ).all()