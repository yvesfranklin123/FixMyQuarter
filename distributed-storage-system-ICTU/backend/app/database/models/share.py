import uuid
import enum
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class SharePermission(str, enum.Enum):
    VIEW = "view"
    DOWNLOAD = "download"
    EDIT = "edit"

# --- SYSTÈME 1 : PARTAGE RÉSEAU (Pour ta Modal Frontend) ---
# Nous nommons cette classe "FileShare" mais elle ne doit PAS 
# utiliser back_populates="shares" pour éviter le conflit.
class FileShare(Base):
    __tablename__ = "file_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission = Column(String, default="read")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # On ne met pas de back_populates ici car 'shares' est déjà pris par la classe Share ci-dessous
    file = relationship("File") 
    shared_with = relationship("User")

# --- SYSTÈME 2 : LIENS PUBLICS (URL / Token) ---
# C'est cette classe qui "répond" à la relation 'shares' de ton fichier file.py
class Share(Base):
    __tablename__ = "shares"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # --- CIBLE ---
    file_id = Column(String, ForeignKey("files.id"), nullable=True)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # --- ACCÈS ---
    token = Column(String, unique=True, index=True)
    is_public = Column(Boolean, default=False)
    password_hash = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    max_downloads = Column(Integer, nullable=True)
    downloads_count = Column(Integer, default=0)
    
    permission = Column(String, default=SharePermission.VIEW)
    
    # --- RELATIONS ---
    # ✅ C'est cette ligne qui se lie au 'shares' de File
    file = relationship("File", back_populates="shares")
    owner = relationship("User", back_populates="shares")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())