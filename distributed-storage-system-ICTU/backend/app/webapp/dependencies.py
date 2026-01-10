from typing import Generator, Annotated, Optional
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.database import models
from app.database.db import SessionLocal
from app.schemas import token as token_schema
from app.database.db import get_db

# --- 1. SESSION DE BASE DE DONNÉES ---
def get_db() -> Generator[Session, None, None]:
    """
    Crée une session DB pour chaque requête et la ferme après.
    Garantit que la connexion est rendue au pool.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Type alias pour simplifier les signatures de fonctions
SessionDep = Annotated[Session, Depends(get_db)]

# --- 2. AUTHENTIFICATION (JWT) ---
# Définit où FastAPI doit chercher le token (Header Authorization: Bearer ...)
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)
TokenDep = Annotated[str, Depends(reusable_oauth2)]

async def get_current_user(db: SessionDep, token: TokenDep) -> models.User:
    """
    Décode le token JWT, valide sa structure et récupère l'utilisateur.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants non valides ou token expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Décodage avec la clé secrète
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = token_schema.TokenPayload(**payload)
        
        if token_data.sub is None:
            raise credentials_exception
            
    except (JWTError, ValidationError):
        raise credentials_exception

    # Récupération de l'utilisateur en DB
    # On pourrait ajouter du caching Redis ici pour éviter de taper la DB à chaque appel
    user = db.query(models.User).filter(models.User.id == int(token_data.sub)).first()
    
    if user is None:
        raise credentials_exception
    return user

# Type alias pour injecter l'utilisateur courant
CurrentUser = Annotated[models.User, Depends(get_current_user)]

# --- 3. VÉRIFICATION DE RÔLES & ÉTAT ---

async def get_current_active_user(current_user: CurrentUser) -> models.User:
    """Vérifie que l'utilisateur n'a pas été banni ou désactivé"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Utilisateur inactif")
    return current_user

async def get_current_superuser(current_user: CurrentUser) -> models.User:
    """Vérifie que l'utilisateur est un Admin/Superuser"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Droits d'administration requis"
        )
    return current_user

# --- 4. UTILITAIRES DE PAGINATION ---

class PaginationParams:
    """Dépendance commune pour gérer skip/limit"""
    def __init__(
        self, 
        skip: int = Query(0, ge=0, description="Nombre d'éléments à sauter"), 
        limit: int = Query(100, ge=1, le=1000, description="Nombre max d'éléments")
    ):
        self.skip = skip
        self.limit = limit

PaginationDep = Annotated[PaginationParams, Depends()]