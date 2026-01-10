from typing import Any
from fastapi import APIRouter, Depends
from app.webapp.dependencies import SessionDep, get_current_superuser
from app.schemas import admin_stats
from datetime import datetime, timedelta
from sqlalchemy import func
from app.database import models

router = APIRouter(dependencies=[Depends(get_current_superuser)])

@router.get("/dashboard", response_model=admin_stats.AdminDashboardStats)
def get_admin_stats(db: SessionDep):
    # 1. Calcul du stockage total (converti en GB)
    total_bytes = db.query(func.sum(models.File.size)).scalar() or 0
    total_gb = round(total_bytes / (1024**3), 2)

    # 2. Nombre total d'utilisateurs
    total_users = db.query(func.count(models.User.id)).scalar()

    # 3. Utilisateurs actifs (ayant un jeton valide ou dernière connexion < 24h)
    # Note: nécessite une colonne last_login dans ton modèle User
    active_24h = total_users # Valeur par défaut pour l'instant

    # 4. Distribution des types de fichiers (Exemple simple)
    # Compte par extension ou mime_type
    dist = {
        "images": db.query(models.File).filter(models.File.mime_type.like('%image%')).count(),
        "documents": db.query(models.File).filter(models.File.mime_type.like('%pdf%')).count(),
        "videos": db.query(models.File).filter(models.File.mime_type.like('%video%')).count(),
        "others": 0
    }

    return {
        "total_users": total_users,
        "active_users_24h": active_24h,
        "total_storage_used_gb": total_gb,
        "total_revenue_mrr": total_users * 9.99, # Simulation : 9.99€ par user
        "nodes_total": 5,
        "nodes_online": 5,
        "user_growth": [
            {"date": "2026-01-05", "count": total_users - 10},
            {"date": "2026-01-06", "count": total_users - 5},
            {"date": "2026-01-07", "count": total_users}
        ],
        "storage_growth": [],
        "file_type_distribution": dist
    }