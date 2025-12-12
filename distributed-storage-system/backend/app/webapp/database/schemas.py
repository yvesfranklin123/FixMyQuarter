from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    quota_limit: int
    quota_used: int
    created_at: datetime

    class Config:
        from_attributes = True

class NodeCreate(BaseModel):
    name: str
    cpu_limit: int
    mem_limit: int

class NodeStats(BaseModel):
    cpu_usage_usec: Optional[int] = 0
    memory_current: Optional[int] = 0
    disk_used: Optional[int] = 0
    status: str

class NodeResponse(BaseModel):
    id: str
    ip_address: str
    status: str
    used_capacity: int
    stats: Optional[NodeStats] = None

    class Config:
        from_attributes = True

class FileCreate(BaseModel):
    pass

class FileResponse(BaseModel):
    id: int
    filename: str
    size: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    action: str
    details: Any
    timestamp: datetime
    username: str

    class Config:
        from_attributes = True