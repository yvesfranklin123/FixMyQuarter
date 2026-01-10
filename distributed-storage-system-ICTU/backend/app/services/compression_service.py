import zipfile
import io
from typing import Generator, List
from app.database import models

class CompressionService:
    @staticmethod
    def stream_zip_folder(files: List[models.File]) -> Generator[bytes, None, None]:
        """
        Générateur qui crée un ZIP à la volée.
        C'est complexe car ZIP nécessite de revenir au début du fichier pour écrire le header,
        ce qui est impossible en streaming pur. On utilise des astuces ou des libs spécialisées.
        """
        # Version simplifiée in-memory pour l'exemple (Attention aux gros fichiers)
        mem_zip = io.BytesIO()
        
        with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for file in files:
                # Ici on récupérerait le contenu réel via le NodeManager
                dummy_content = b"Content retrieved from node" 
                zf.writestr(file.name, dummy_content)
                
                # Yield des chunks si on implémente un vrai stream
        
        mem_zip.seek(0)
        yield mem_zip.getvalue()