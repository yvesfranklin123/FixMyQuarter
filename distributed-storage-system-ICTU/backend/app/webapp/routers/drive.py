import os
import shutil  # Ajouté pour la copie physique
from typing import List, Any, Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from app.webapp.dependencies import SessionDep, CurrentUser
from app.services.file_manager import FileManager
from app.services.thumbnail_service import ThumbnailService
from app.schemas import file as file_schema
from fastapi import File, Form, UploadFile
from app.database import models

router = APIRouter()
thumbnail_service = ThumbnailService()
UPLOAD_DIR = "uploads"

# --- 1. ROUTES FIXES (Priorité haute) ---

@router.get("/files", response_model=dict)
def get_drive_root(db: SessionDep, current_user: CurrentUser) -> Any:
    """Récupère les fragments à la racine."""
    query = db.query(models.File).filter(
        models.File.owner_id == current_user.id,
        models.File.folder_id == None
    )
    if hasattr(models.File, 'is_deleted'):
        query = query.filter(models.File.is_deleted == False)
    
    files_db = query.all()
    return {
        "files": [file_schema.FileResponse.model_validate(f) for f in files_db],
        "breadcrumbs": []
    }

@router.get("/files/shared", response_model=dict)
def get_shared_files(db: SessionDep, current_user: CurrentUser) -> Any:
    """Récupère les fragments partagés par d'autres utilisateurs."""
    files_db = db.query(models.File).filter(
        models.File.owner_id != current_user.id
    ).all()
    
    return {
        "files": [file_schema.FileResponse.model_validate(f) for f in files_db],
        "breadcrumbs": []
    }

# app/webapp/routers/drive.py

@router.post("/upload", response_model=List[file_schema.FileResponse], status_code=201)
async def upload_files(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    # Utiliser File(...) sans List si tu n'envoies qu'un fichier à la fois
    file: UploadFile = File(..., alias="file"), 
    # Utiliser Form(None) pour rendre le folder_id optionnel et flexible
    folder_id: Optional[str] = Form(None),
    background_tasks: BackgroundTasks
) -> Any:
    file_manager = FileManager(db)
    
    # Lecture du binaire
    file_content = await file.read() 
    
    # Nettoyage sécurisé de l'ID secteur
    target_folder = None
    if folder_id and folder_id not in ["root", "null", "undefined", ""]:
        target_folder = folder_id

    # 1. Synchronisation Métadonnées Nexus
    db_file = await file_manager.create_file_metadata(
        metadata=file_schema.FileCreate(
            name=file.filename, 
            folder_id=target_folder
        ),
        owner_id=current_user.id,
        size=len(file_content),
        mime_type=file.content_type or "application/octet-stream",
        node_id="nexus-node-01"
    )

    # 2. Persistance Physique (Vérifie que le dossier 'uploads' existe)
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    file_path = os.path.join(UPLOAD_DIR, str(db_file.id))
    with open(file_path, "wb") as f:
        f.write(file_content)

    # 3. Traitement asynchrone (Thumbnails)
    background_tasks.add_task(thumbnail_service.generate_preview, file_id=db_file.id)
    
    return [file_schema.FileResponse.model_validate(db_file)]
    file_manager = FileManager(db)
    
    # On traite directement 'file' au lieu de boucler sur 'files'
    file_content = await file.read() 
    
    target_folder = folder_id if folder_id not in ["root", "null", "undefined", ""] else None

    db_file = await file_manager.create_file_metadata(
        metadata=file_schema.FileCreate(name=file.filename, folder_id=target_folder),
        owner_id=current_user.id,
        size=len(file_content),
        mime_type=file.content_type or "application/octet-stream",
        node_id="nexus-node-01"
    )

    file_path = os.path.join("uploads", str(db_file.id))
    with open(file_path, "wb") as f:
        f.write(file_content)

    background_tasks.add_task(thumbnail_service.generate_preview, file_id=db_file.id)
    
    return [file_schema.FileResponse.model_validate(db_file)]
# --- 2. ROUTES PUBLIQUES (Sans authentification) ---

@router.get("/share/preview/{file_id}")
def get_public_preview(file_id: str, db: SessionDep):
    """Accès public au fragment via lien direct."""
    file_meta = db.query(models.File).filter_by(id=file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404, detail="Lien invalide")

    file_path = os.path.join(UPLOAD_DIR, str(file_id))
    return FileResponse(
        path=file_path, 
        filename=file_meta.name, 
        media_type=file_meta.mime_type,
        content_disposition_type="inline"
    )

# --- 3. ROUTES DYNAMIQUES (Authentifiées) ---

@router.get("/{file_id}", response_model=file_schema.FileResponse)
def get_file_details(file_id: str, db: SessionDep, current_user: CurrentUser):
    """Détails d'un fragment spécifique."""
    file = db.query(models.File).filter(models.File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404)
    return file_schema.FileResponse.model_validate(file)

@router.get("/{file_id}/download")
def download_file(file_id: str, db: SessionDep, current_user: CurrentUser):
    """Téléchargement sécurisé."""
    file_meta = db.query(models.File).filter(models.File.id == file_id).first()
    if not file_meta:
        raise HTTPException(status_code=404)

    file_path = os.path.join(UPLOAD_DIR, str(file_id))
    return FileResponse(
        path=file_path,
        filename=file_meta.name,
        media_type=file_meta.mime_type,
        content_disposition_type="inline"
    )

@router.patch("/{file_id}", response_model=file_schema.FileResponse)
def update_file(file_id: str, obj_in: file_schema.FileUpdate, db: SessionDep, current_user: CurrentUser):
    """Édition (Nom, Star, Trash)."""
    file = db.query(models.File).filter_by(id=file_id, owner_id=current_user.id).first()
    if not file:
        raise HTTPException(status_code=404)
    
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(file, field, value)
    
    file.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(file)
    return file_schema.FileResponse.model_validate(file)

@router.delete("/files/{file_id}", status_code=204)
def delete_file(file_id: str, db: SessionDep, current_user: CurrentUser):
    """Suppression définitive ou mise à la corbeille."""
    file = db.query(models.File).filter(
        models.File.id == file_id, 
        models.File.owner_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="Fragment introuvable")

    file_manager = FileManager(db)
    try:
        file_manager.move_to_trash(file_id, current_user.id)
    except Exception:
        db.delete(file)
        db.commit()
    return None

@router.get("/files/trash", response_model=dict)
def get_trash_files(db: SessionDep, current_user: CurrentUser):
    files_db = db.query(models.File).filter_by(owner_id=current_user.id, is_trashed=True).all()
    return {
        "files": [file_schema.FileResponse.model_validate(f) for f in files_db]
    }

@router.delete("/files/{file_id}/hard", status_code=204)
def hard_delete_file(file_id: str, db: SessionDep, current_user: CurrentUser):
    """Suppression physique et définitive du fragment."""
    file = db.query(models.File).filter_by(id=file_id, owner_id=current_user.id).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="Fragment introuvable")

    file_path = os.path.join(UPLOAD_DIR, str(file.id))
    if os.path.exists(file_path):
        os.remove(file_path)

    current_user.used_storage -= file.size

    db.delete(file)
    db.commit()
    return None

@router.delete("/trash/empty", status_code=204)
def empty_trash(db: SessionDep, current_user: CurrentUser):
    """Désintègre tous les fichiers de la corbeille."""
    trashed_files = db.query(models.File).filter_by(owner_id=current_user.id, is_trashed=True).all()
    
    for file in trashed_files:
        file_path = os.path.join(UPLOAD_DIR, str(file.id))
        if os.path.exists(file_path):
            os.remove(file_path)
        current_user.used_storage -= file.size
        db.delete(file)
    
    db.commit()
    return None

@router.post("/files/{file_id}/copy", response_model=file_schema.FileResponse)
def copy_file(
    file_id: str, 
    db: SessionDep, 
    current_user: CurrentUser,
    target_folder_id: Optional[str] = None
):
    """Clonage d'un fragment vers une destination spécifique."""
    # 1. Récupérer l'original
    original = db.query(models.File).filter_by(id=file_id, owner_id=current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Fragment original introuvable")

    # 2. Créer la copie (Métadonnées)
    copy_metadata = models.File(
        name=f"{original.name} (Copie)",
        size=original.size,
        mime_type=original.mime_type,
        folder_id=target_folder_id,
        owner_id=current_user.id,
        node_id=original.node_id,
        is_trashed=False
    )

    db.add(copy_metadata)
    db.flush() # Pour obtenir l'ID de la copie avant le commit final

    # 3. Copie physique du fichier sur le disque
    original_path = os.path.join(UPLOAD_DIR, str(original.id))
    copy_path = os.path.join(UPLOAD_DIR, str(copy_metadata.id))

    if os.path.exists(original_path):
        shutil.copy(original_path, copy_path)
        # Mise à jour du quota utilisateur pour la nouvelle copie
        current_user.used_storage += original.size
    
    db.commit()
    db.refresh(copy_metadata)
    return copy_metadata
from sqlalchemy import or_

@router.post("/{file_id}/share-with/{user_id}")
def share_file_with_user(file_id: str, user_id: int, db: SessionDep, current_user: CurrentUser):
    # 1. Vérifier si le fichier existe et appartient à l'appelant
    file = db.query(models.File).filter_by(id=file_id, owner_id=current_user.id).first()
    if not file:
        raise HTTPException(status_code=404, detail="Fragment non trouvé")

    # 2. Vérifier si le partage existe déjà
    existing = db.query(models.FileShare).filter_by(
        file_id=file_id, 
        shared_with_user_id=user_id
    ).first()
    
    if existing:
        return {"status": "Déjà partagé"}

    # 3. Créer le partage interne
    new_share = models.FileShare(
        file_id=file_id, 
        shared_with_user_id=user_id,
        permission="read"
    )
    db.add(new_share)
    db.commit()
    
    return {"status": "Liaison réseau établie"}

# app/webapp/routers/drive.py

@router.get("/files/shared", response_model=dict)
def get_shared_files(db: SessionDep, current_user: CurrentUser):
    """
    Récupère UNIQUEMENT les fragments envoyés spécifiquement 
    à l'utilisateur connecté par d'autres membres du réseau.
    """
    # 1. On rejoint la table file_shares
    # 2. On charge l'owner pour savoir qui nous l'a envoyé
    shared_files = db.query(models.File)\
        .join(models.FileShare)\
        .options(joinedload(models.File.owner))\
        .filter(
            # Condition 1 : L'ID de l'utilisateur connecté doit être le destinataire
            models.FileShare.shared_with_user_id == current_user.id,
            # Condition 2 : Sécurité - on ne montre pas un fichier supprimé
            models.File.is_trashed == False,
            # Condition 3 : On exclut les fichiers dont on est déjà le proprio 
            # (au cas où on s'enverrait un fichier à soi-même)
            models.File.owner_id != current_user.id
        ).all()
    
    return {
        "files": [file_schema.FileResponse.model_validate(f) for f in shared_files]
    }