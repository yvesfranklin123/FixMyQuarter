import hashlib
from typing import Generator, Tuple
from ..config import settings

def iter_chunks(file_obj, chunk_size: int = None) -> Generator[Tuple[int, str, bytes], None, None]:
    """
    Lit un fichier (file-like object) et génère des chunks.
    Retourne: (index, sha256_checksum, data_bytes)
    """
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE_BYTES

    chunk_index = 0
    while True:
        data = file_obj.read(chunk_size)
        if not data:
            break
        
        sha256_hash = hashlib.sha256(data).hexdigest()
        yield chunk_index, sha256_hash, data
        
        chunk_index += 1

def calculate_checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()