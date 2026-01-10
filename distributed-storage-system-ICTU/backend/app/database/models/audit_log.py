from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null si Système
    
    event_type = Column(String, index=True) # LOGIN, DELETE_FILE, SHARE_LINK, BAN_USER
    target_resource = Column(String) # 'file:uuid-1234'
    
    ip_address = Column(INET, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Détails contextuels (ex: ancien nom fichier, nouveau nom)
    details = Column(JSONB, nullable=True) 
    
    status = Column(String) # 'SUCCESS', 'FAILURE'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    actor = relationship("User", back_populates="audit_logs")