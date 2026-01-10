from typing import Any, List
from fastapi import APIRouter, HTTPException
from app.webapp.dependencies import SessionDep, CurrentUser, PaginationDep
from app.database import models
# Note: On définit un schema simple ici pour l'exemple, ou on l'importe de schemas/notification.py
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    link: str | None

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    db: SessionDep,
    current_user: CurrentUser,
    pagination: PaginationDep
) -> Any:
    """Récupère les dernières notifications de l'utilisateur."""
    notifs = db.query(models.Notification)\
        .filter_by(recipient_id=current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .offset(pagination.skip)\
        .limit(pagination.limit)\
        .all()
    return notifs

@router.post("/{notif_id}/read")
def mark_as_read(
    notif_id: int,
    db: SessionDep,
    current_user: CurrentUser
) -> Any:
    """Marque une notification comme lue."""
    notif = db.query(models.Notification).filter_by(id=notif_id, recipient_id=current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    
    notif.is_read = True
    db.commit()
    return {"status": "success"}