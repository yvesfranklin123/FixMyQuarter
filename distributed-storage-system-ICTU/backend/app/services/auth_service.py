import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core import security
from app.database import models
from app.schemas import auth_2fa as schema_2fa

class AuthService:
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[models.User]:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return None
        if not security.verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, db: Session, email: str, password: str, full_name: str) -> models.User:
        user = models.User(
            email=email,
            hashed_password=security.get_password_hash(password),
            full_name=full_name,
            public_id=str(uuid.uuid4())
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def setup_2fa(self, db: Session, user: models.User) -> schema_2fa.Enable2FAResponse:
        # Génération du secret TOTP
        secret = security.generate_2fa_secret()
        user.totp_secret = secret
        
        # Génération des codes de secours (chiffrés en base)
        backup_codes = [security.generate_token(length=8) for _ in range(5)]
        user.backup_codes = security.hash_backup_codes(backup_codes) # Hypothétique fonction helper
        
        db.commit()
        
        # Génération de l'URI pour le QR Code
        uri = security.get_totp_uri(secret, user.email)
        return schema_2fa.Enable2FAResponse(otp_uri=uri, secret=secret, backup_codes=backup_codes)

    def verify_2fa(self, db: Session, user: models.User, code: str) -> bool:
        if not user.totp_secret:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "2FA not enabled")
        
        is_valid = security.verify_totp(user.totp_secret, code)
        if is_valid and not user.is_2fa_enabled:
            # Activation définitive après premier code valide
            user.is_2fa_enabled = True
            db.commit()
            
        return is_valid