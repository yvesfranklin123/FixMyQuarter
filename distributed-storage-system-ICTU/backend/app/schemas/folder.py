from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class FolderBase(BaseModel):
    name: str
    color: Optional[str] = "#A0AEC0"

class FolderCreate(FolderBase):
    parent_id: Optional[str] = None

class FolderUpdate(FolderBase):
    parent_id: Optional[str] = None
    is_trashed: Optional[bool] = None

class FolderResponse(FolderBase):
    id: str
    parent_id: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)