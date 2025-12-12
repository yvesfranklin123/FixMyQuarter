from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import models, schemas
from app.webapp import dependencies
from app.config import settings

router = APIRouter()

@router.get("/audit", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp,
            "username": log.user.username
        })
    return result

@router.get("/system-stats")
def get_system_stats(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    total_nodes = db.query(models.Node).count()
    online_nodes = db.query(models.Node).filter(models.Node.status == "ONLINE").count()
    total_files = db.query(models.File).count()
    total_storage = db.query(models.Node).with_entities(models.Node.used_capacity).all()
    used_bytes = sum([x[0] for x in total_storage])

    return {
        "nodes": {"total": total_nodes, "online": online_nodes},
        "files": total_files,
        "storage_used_bytes": used_bytes
    }