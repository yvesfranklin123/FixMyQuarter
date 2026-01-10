from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, status
from app.webapp.dependencies import SessionDep, CurrentUser
from app.schemas import folder as folder_schema
from app.database import models

# On utilise "" pour éviter les conflits de redirection 405/404
router = APIRouter()

@router.post("", response_model=folder_schema.FolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    folder_in: folder_schema.FolderCreate
) -> Any:
    """
    Initialise un nouveau secteur de stockage (dossier).
    Vérifie l'existence du parent et empêche les doublons nommés.
    """
    # 1. Validation de l'arborescence
    if folder_in.parent_id:
        parent = db.query(models.Folder).filter_by(
            id=folder_in.parent_id, 
            owner_id=current_user.id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Secteur parent introuvable dans le cluster"
            )

    # 2. Prévention des collisions de noms
    existing = db.query(models.Folder).filter_by(
        name=folder_in.name,
        parent_id=folder_in.parent_id,
        owner_id=current_user.id,
        is_trashed=False
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Un dossier avec ce nom existe déjà dans ce secteur"
        )

    # 3. Injection dans la base de données
    folder = models.Folder(
        name=folder_in.name,
        color=folder_in.color or "#3b82f6",  # Bleu Nexus Onyx
        parent_id=folder_in.parent_id,
        owner_id=current_user.id
    )
    
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder

@router.get("", response_model=List[folder_schema.FolderResponse])
def list_folders(
    db: SessionDep,
    current_user: CurrentUser,
    parent_id: Optional[str] = None
) -> Any:
    """
    Liste les dossiers actifs. 
    Gère intelligemment les requêtes racines (parent_id null).
    """
    query = db.query(models.Folder).filter_by(owner_id=current_user.id, is_trashed=False)
    
    # Filtrage de la hiérarchie
    if parent_id and parent_id not in ["root", "null", "undefined"]:
        query = query.filter_by(parent_id=parent_id)
    else:
        query = query.filter(models.Folder.parent_id.is_(None))
        
    return query.all()

@router.get("/{folder_id}", response_model=folder_schema.FolderResponse)
def get_folder_details(
    folder_id: str,
    db: SessionDep,
    current_user: CurrentUser
) -> Any:
    """Récupère l'état complet d'un dossier spécifique."""
    folder = db.query(models.Folder).filter_by(
        id=folder_id, 
        owner_id=current_user.id
    ).first()
    
    if not folder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Secteur de données introuvable"
        )
    return folder

@router.delete("/{folder_id}", status_code=204)
def delete_folder(folder_id: str, db: SessionDep, current_user: CurrentUser):
    """Suppression d'un secteur (dossier) et déconnexion des fragments rattachés."""
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id, 
        models.Folder.owner_id == current_user.id
    ).first()

    if not folder:
        raise HTTPException(status_code=404, detail="Secteur introuvable")

    # OPTION A : Supprimer les fichiers à l'intérieur (Cascade)
    # db.query(models.File).filter(models.File.folder_id == folder_id).delete()

    # OPTION B : Déplacer les fichiers vers la racine pour ne pas les perdre
    db.query(models.File).filter(models.File.folder_id == folder_id).update({"folder_id": None})

    db.delete(folder)
    db.commit()
    return None