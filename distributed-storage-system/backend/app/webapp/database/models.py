from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    quota_limit = Column(Integer, default=524288000)
    quota_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    files = relationship("File", back_populates="owner")
    audit_logs = relationship("AuditLog", back_populates="user")

class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, index=True)
    ip_address = Column(String)
    port = Column(Integer, default=9999)
    status = Column(String, default="ONLINE")
    cpu_limit = Column(Integer)
    mem_limit = Column(Integer)
    total_capacity = Column(Integer)
    used_capacity = Column(Integer, default=0)
    stats = Column(JSON, nullable=True)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunk_locations = relationship("ChunkLocation", back_populates="node")

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    size = Column(Integer)
    checksum = Column(String)
    status = Column(String, default="UPLOADING")
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="files")
    chunks = relationship("FileChunk", back_populates="file", cascade="all, delete-orphan")

class FileChunk(Base):
    __tablename__ = "file_chunks"

    id = Column(String, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    chunk_index = Column(Integer)
    size = Column(Integer)
    checksum = Column(String)
    
    file = relationship("File", back_populates="chunks")
    locations = relationship("ChunkLocation", back_populates="chunk", cascade="all, delete-orphan")

class ChunkLocation(Base):
    __tablename__ = "chunk_locations"

    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(String, ForeignKey("file_chunks.id"))
    node_id = Column(String, ForeignKey("nodes.id"))
    is_primary = Column(Boolean, default=False)
    
    chunk = relationship("FileChunk", back_populates="locations")
    node = relationship("Node", back_populates="chunk_locations")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")