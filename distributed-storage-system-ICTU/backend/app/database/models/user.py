import uuid
from sqlalchemy import Column, String, Boolean, BigInteger, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # --- AUTHENTIFICATION ---
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    
    # --- SÉCURITÉ 2FA ---
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True) # Clé secrète Google Auth
    backup_codes = Column(String, nullable=True) # JSON stocké en string (crypté)

    # --- RÔLES & ÉTAT ---
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default="user") # 'user', 'admin', 'auditor'

    # --- QUOTA & STOCKAGE (SaaS) ---
    storage_limit = Column(BigInteger, default=1 * 1024 * 1024 * 1024) # 5 GB par défaut
    used_storage = Column(BigInteger, default=0) # Mis à jour par triggers ou workers
    
    # --- RELATIONS ---
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="owner")
    audit_logs = relationship("AuditLog", back_populates="actor")
    notifications = relationship("Notification", back_populates="recipient")
    subscription = relationship("Subscription", uselist=False, back_populates="user")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    shares = relationship("Share", back_populates="owner")
    files = relationship("File", back_populates="owner")