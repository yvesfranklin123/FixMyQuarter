from typing import List, Optional
from pydantic import BaseModel
from .file import FileResponse
from .folder import FolderResponse

class Breadcrumb(BaseModel):
    id: str
    name: str

class DriveContent(BaseModel):
    """Réponse composite pour l'affichage d'un dossier"""
    current_folder: Optional[FolderResponse] # Null si racine
    breadcrumbs: List[Breadcrumb] # Chemin: Accueil > Documents > Projets
    
    folders: List[FolderResponse]
    files: List[FileResponse]
    
    total_items: int