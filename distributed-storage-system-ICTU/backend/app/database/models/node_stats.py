from sqlalchemy import Column, Integer, String, Float, DateTime, BigInteger
from sqlalchemy.sql import func
from app.database.base import Base

class NodeStats(Base):
    __tablename__ = "node_stats"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(String, index=True, nullable=False)
    
    # --- RESSOURCES ---
    cpu_usage = Column(Float) # %
    ram_usage = Column(Float) # %
    ram_available = Column(BigInteger) # Octets
    
    # --- STOCKAGE ---
    disk_total = Column(BigInteger)
    disk_used = Column(BigInteger)
    disk_free = Column(BigInteger)
    
    # --- RÉSEAU ---
    network_rx = Column(BigInteger) # Bytes reçus
    network_tx = Column(BigInteger) # Bytes envoyés
    active_connections = Column(Integer)
    
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)