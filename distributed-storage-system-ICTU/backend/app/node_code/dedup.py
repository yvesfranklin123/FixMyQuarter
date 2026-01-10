import hashlib
import os
import aiofiles
import logging
import asyncio
from typing import Tuple

from .storage_encryption import local_cipher

# Chemins de stockage
STORAGE_ROOT = os.getenv("STORAGE_ROOT", "/data")
BLOCKS_DIR = os.path.join(STORAGE_ROOT, "blocks")
TEMP_DIR = os.path.join(STORAGE_ROOT, "tmp")

# Création des dossiers au démarrage
os.makedirs(BLOCKS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

logger = logging.getLogger("node.dedup")

class DedupEngine:
    @staticmethod
    def calculate_hash(data: bytes) -> str:
        """SHA-256 performant"""
        return hashlib.sha256(data).hexdigest()

    async def write_block(self, data: bytes) -> Tuple[str, bool, int]:
        """
        Écrit un bloc de données de manière dédupliquée et chiffrée.
        Retourne: (hash_id, is_new_write, size_on_disk)
        """
        # 1. Calcul du Hash sur la donnée EN CLAIR (pour la déduplication logique)
        content_hash = self.calculate_hash(data)
        
        # Structure de dossier "sharding" pour éviter 1M de fichiers dans un dossier
        # ex: /data/blocks/a/f/af45e...
        subdir = os.path.join(BLOCKS_DIR, content_hash[:2])
        os.makedirs(subdir, exist_ok=True)
        final_path = os.path.join(subdir, content_hash)

        # 2. Vérification d'existence (Deduplication Hit)
        if os.path.exists(final_path):
            logger.info(f"♻️  Dedup hit: {content_hash}")
            # On retourne la taille existante
            return content_hash, False, os.path.getsize(final_path)

        # 3. Chiffrement (Security at Rest)
        encrypted_data = local_cipher.encrypt_block(data)

        # 4. Écriture Atomique (Crash-safe)
        # On écrit d'abord dans un fichier temporaire
        temp_path = os.path.join(TEMP_DIR, f"tmp_{content_hash}")
        
        try:
            async with aiofiles.open(temp_path, mode='wb') as f:
                await f.write(encrypted_data)
                await f.flush()
                # Force l'écriture physique sur le disque
                os.fsync(f.fileno()) 
            
            # Renommage atomique : c'est instantané et sûr
            os.rename(temp_path, final_path)
            
            logger.info(f"💾 Block written: {content_hash} ({len(encrypted_data)} bytes)")
            return content_hash, True, len(encrypted_data)
            
        except Exception as e:
            # Nettoyage en cas d'erreur
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise IOError(f"Write failed: {str(e)}")

    async def read_block(self, content_hash: str) -> bytes:
        """Lit, déchiffre et renvoie les données"""
        subdir = os.path.join(BLOCKS_DIR, content_hash[:2])
        path = os.path.join(subdir, content_hash)

        if not os.path.exists(path):
            raise FileNotFoundError(f"Block {content_hash} missing on this node")

        async with aiofiles.open(path, mode='rb') as f:
            encrypted_data = await f.read()

        # Déchiffrement à la volée
        return local_cipher.decrypt_block(encrypted_data)

    async def delete_block(self, content_hash: str):
        """
        Suppression physique.
        Note: Dans un vrai système CAS, on utilise un Reference Counting 
        avant de supprimer vraiment. Ici, on simplifie (Hard Delete).
        """
        subdir = os.path.join(BLOCKS_DIR, content_hash[:2])
        path = os.path.join(subdir, content_hash)
        
        if os.path.exists(path):
            os.remove(path)
            return True
        return False