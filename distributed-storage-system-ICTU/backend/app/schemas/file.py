from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# --- 1. CLASSE DE BASE (DOIT ÊTRE EN PREMIER) ---
class FileBase(BaseModel):
    name: str
    folder_id: Optional[str] = None

# --- 2. SCHEMA POUR LA CRÉATION ---
class FileCreate(FileBase):
    pass

# --- 3. SCHEMA POUR LA MISE À JOUR ---
class FileUpdate(BaseModel):
    name: Optional[str] = None
    is_trashed: Optional[bool] = None
    is_starred: Optional[bool] = None
    folder_id: Optional[str] = None

# --- 4. SCHEMA POUR LA RÉPONSE ---
class FileResponse(FileBase):
    id: str
    size: int
    mime_type: str
    extension: Optional[str] = Field(default="") 
    owner_id: int
    is_trashed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None 

    model_config = ConfigDict(from_attributes=True)