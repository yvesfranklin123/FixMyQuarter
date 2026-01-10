from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info" # info, warning, error, success
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    recipient_id: int

class Notification(NotificationBase):
    id: int
    recipient_id: int
    is_read: bool
    created_at: datetime

    # Config Pydantic v2 pour compatibilité SQLAlchemy
    model_config = ConfigDict(from_attributes=True)