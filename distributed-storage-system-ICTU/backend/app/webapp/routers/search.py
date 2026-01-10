from typing import Any, List
from fastapi import APIRouter, Query
from app.webapp.dependencies import SessionDep, CurrentUser
from app.database import models
from app.schemas import file as file_schema

router = APIRouter()

@router.get("/files", response_model=List[file_schema.FileResponse])
def search_files(
    query: str = Query(..., min_length=2),
    db: SessionDep = None,
    current_user: CurrentUser = None
) -> Any:
    """
    Recherche simple par nom.
    Pour le paroxysme, c'est ici qu'on appellerait `search_service.query_elasticsearch(query)`.
    """
    # Recherche SQL insensible à la casse (%query%)
    results = db.query(models.File).filter(
        models.File.owner_id == current_user.id,
        models.File.name.ilike(f"%{query}%"),
        models.File.is_trashed == False
    ).limit(50).all()
    
    return results