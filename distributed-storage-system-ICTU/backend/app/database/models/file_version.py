import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, BigInteger, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class FileVersion(Base):
    __tablename__ = "file_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey("files.id"), nullable=False, index=True)
    
    # --- DÉTAILS DE LA VERSION ---
    version_number = Column(Integer, nullable=False)
    size = Column(BigInteger, nullable=False)
    content_hash = Column(String) # Le hash de CETTE version
    path_on_disk = Column(String) # Où est stockée l'archive de cette version
    
    # --- MÉTA ---
    modified_by_id = Column(Integer, ForeignKey("users.id"))
    change_summary = Column(String, nullable=True) # "Modifié via API", "Upload manuel"
    
    file = relationship("File", back_populates="versions")
    created_at = Column(DateTime(timezone=True), server_default=func.now())