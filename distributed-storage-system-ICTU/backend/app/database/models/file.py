import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, BigInteger, Boolean, DateTime, Float
from sqlalchemy.dialects.postgresql import JSONB  # Nécessite PostgreSQL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    extension = Column(String)
    size = Column(BigInteger, nullable=False) # En octets
    mime_type = Column(String)
    
    # --- LOCALISATION PHYSIQUE ---
    content_hash = Column(String, index=True) # SHA-256 pour déduplication
    node_id = Column(String, index=True) # ID du container Docker/K8s
    path_on_disk = Column(String) # Chemin interne sur le node
    
    # --- SÉCURITÉ ---
    is_encrypted = Column(Boolean, default=True)
    encryption_key_id = Column(String, nullable=True) # ID KMS ou clé chiffrée
    iv = Column(String, nullable=True) # Vecteur d'initialisation AES
    
    # --- ORGANISATION ---
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # --- ÉTAT ---
    is_trashed = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    trashed_at = Column(DateTime(timezone=True), nullable=True)
    
    # --- RELATIONS ---
    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    versions = relationship("FileVersion", back_populates="file", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="file", cascade="all, delete-orphan")
    virus_scan = relationship("VirusScan", uselist=False, back_populates="file")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
