from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from app.webapp.dependencies import SessionDep, CurrentUser
from app.services.share_service import ShareService
from app.schemas import file as file_schema

router = APIRouter()
share_service = ShareService()

@router.post("/create/{file_id}")
def create_share_link(
    file_id: str,
    db: SessionDep,
    current_user: CurrentUser,
    password: str = None,
    expires_in_days: int = 7
) -> Any:
    """Génère un lien public unique pour un fichier."""
    # Vérification appartenance
    share = share_service.create_public_link(db, file_id, expires_in_days, password)
    return {"link": f"https://nexuscloud.com/s/{share.token}", "expires_at": share.expires_at}

@router.get("/public/{token}", response_model=file_schema.FileResponse)
def access_public_file(
    token: str,
    db: SessionDep,
    password: str = Query(None)
) -> Any:
    """
    Accès public (sans Auth user) à un fichier via son token.
    Vérifie l'expiration et le mot de passe optionnel.
    """
    try:
        file = share_service.access_public_share(db, token, password)
        return file
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))