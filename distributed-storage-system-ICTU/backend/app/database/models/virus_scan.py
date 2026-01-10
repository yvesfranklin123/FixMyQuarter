from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class VirusScan(Base):
    __tablename__ = "virus_scans"

    id = Column(Integer, primary_key=True)
    file_id = Column(String, ForeignKey("files.id"), unique=True)
    
    status = Column(String, default="pending") # pending, clean, infected, failed
    virus_name = Column(String, nullable=True) # ex: 'Eicar-Test-Signature'
    scan_engine = Column(String, default="ClamAV")
    
    scanned_at = Column(DateTime(timezone=True), nullable=True)
    
    file = relationship("File", back_populates="virus_scan")