from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.webapp.database.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class StorageNode(Base):
    __tablename__ = "storage_nodes"
    id = Column(String, primary_key=True)  # ex: "node-01"
    ip_address = Column(String, unique=True)
    total_capacity = Column(BigInteger) # en octets
    available_capacity = Column(BigInteger)
    is_online = Column(Boolean, default=False)
    last_heartbeat = Column(DateTime(timezone=True), onupdate=func.now())

class FileMetadata(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    size = Column(BigInteger)
    checksum = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relation avec les chunks (un fichier a plusieurs chunks)
    chunks = relationship("FileChunk", back_populates="file")

class FileChunk(Base):
    __tablename__ = "chunks"
    id = Column(String, primary_key=True) # Hash du chunk
    file_id = Column(Integer, ForeignKey("files.id"))
    chunk_index = Column(Integer)
    node_id = Column(String, ForeignKey("storage_nodes.id"))
    
    file = relationship("FileMetadata", back_populates="chunks")