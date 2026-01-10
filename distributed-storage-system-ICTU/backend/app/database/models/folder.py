import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Folder(Base):
    __tablename__ = "folders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    
    # --- HIERARCHIE ---
    parent_id = Column(String, ForeignKey("folders.id"), nullable=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # --- ÉTAT ---
    is_trashed = Column(Boolean, default=False)
    color = Column(String, default="#A0AEC0") # Pour l'UI
    
    # --- RELATIONS ---
    owner = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], back_populates="subfolders")
    subfolders = relationship("Folder", back_populates="parent", cascade="all, delete-orphan")
    files = relationship("File", back_populates="folder", cascade="all, delete-orphan")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())