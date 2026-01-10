from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from app.database import models
from app.core import security

class ShareService:
    def create_public_link(
        self, db: Session, file_id: str, expires_in_days: int = 7, password: str = None
    ) -> models.Share:
        token = secrets.token_urlsafe(32)
        hashed_pwd = security.get_password_hash(password) if password else None
        
        share = models.Share(
            file_id=file_id,
            token=token,
            is_public=True,
            password_hash=hashed_pwd,
            expires_at=datetime.utcnow() + timedelta(days=expires_in_days),
            permission="view"
        )
        db.add(share)
        db.commit()
        return share

    def access_public_share(self, db: Session, token: str, password: str = None):
        share = db.query(models.Share).filter_by(token=token).first()
        
        if not share:
            raise ValueError("Lien invalide")
        
        if share.expires_at and share.expires_at < datetime.utcnow():
            raise ValueError("Lien expiré")
            
        if share.password_hash:
            if not password or not security.verify_password(password, share.password_hash):
                raise ValueError("Mot de passe requis ou incorrect")
                
        return share.file