from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Imports Nexus Core
from app.webapp.dependencies import SessionDep, CurrentUser
from app.services.auth_service import AuthService
from app.schemas import user as user_schema
from app.schemas import token as token_schema
from app.schemas import auth_2fa as schema_2fa
from app.core import security

# Importation du modèle User depuis le chemin validé par ton arborescence
from app.database.models import User

router = APIRouter()
auth_service = AuthService()

@router.post("/login", response_model=token_schema.Token)
def login_access_token(
    db: SessionDep, 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login. 
    Vérifie les identifiants et délivre un certificat d'accès (JWT).
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Identifiants réseau incorrects"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Ce Node utilisateur est actuellement inactif"
        )

    # Configuration de l'expiration depuis les settings
    access_token_expires = security.settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=None
        ),
        "token_type": "bearer",
        "expires_in": access_token_expires * 60
    }

@router.post("/register", response_model=user_schema.User, status_code=201)
def register_new_user(
    *,
    db: SessionDep,
    user_in: user_schema.UserCreate,
) -> Any:
    """
    Enrôlement d'un nouveau membre sur le réseau Nexus.
    Initialise le coffre-fort et les métadonnées utilisateur.
    """
    # Vérification de l'unicité de l'identifiant (Email)
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if user:
        raise HTTPException(
            status_code=400,
            detail="Cet identifiant est déjà enregistré sur le maillage."
        )
    
    # Création via le service (gère le hachage sécurisé du mot de passe)
    new_user = auth_service.create_user(
        db, 
        email=user_in.email, 
        password=user_in.password, 
        full_name=user_in.full_name
    )
    
    return new_user

@router.post("/2fa/enable", response_model=schema_2fa.Enable2FAResponse)
def enable_2fa(
    db: SessionDep,
    current_user: CurrentUser
) -> Any:
    """
    Active la double authentification pour un niveau de sécurité souverain.
    """
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="Protocole 2FA déjà actif")
    
    return auth_service.setup_2fa(db, current_user)

@router.post("/2fa/verify", response_model=bool)
def verify_2fa_setup(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    code_data: schema_2fa.Verify2FARequest
) -> Any:
    """
    Validation finale du code de synchronisation 2FA.
    """
    is_valid = auth_service.verify_2fa(db, current_user, code_data.code)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Code de synchronisation invalide")
        
    return True