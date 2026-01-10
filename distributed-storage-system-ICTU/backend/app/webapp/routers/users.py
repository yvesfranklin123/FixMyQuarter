from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.webapp.dependencies import get_current_user
from app.schemas.user import User as UserSchema
from app.webapp.dependencies import SessionDep
from app.database import models
from app.webapp.dependencies import SessionDep

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user=Depends(get_current_user)):
    """
    Récupère les informations de l'utilisateur connecté.
    C'est cette route qui débloquera le 'Chargement...' sur le Frontend.
    """
    return current_user

@router.get("/search")
def search_user_by_email(email: str, db: SessionDep):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Nœud utilisateur introuvable")
    
    return {
        "id": user.id, 
        "full_name": user.full_name,
        "email": user.email
    }