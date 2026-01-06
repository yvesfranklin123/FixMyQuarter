import hashlib
import os
from typing import Generator, Tuple

def calculate_checksum(data: bytes) -> str:
    """Calcule le hash SHA256 d'un bloc de données."""
    return hashlib.sha256(data).hexdigest()

def file_chunker(file_path: str, chunk_size: int) -> Generator[Tuple[int, bytes, str], None, None]:
    """
    Lit un fichier et le découpe en morceaux (chunks).
    Yield: (index, données_binaires, checksum)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Le fichier {file_path} n'existe pas.")

    with open(file_path, "rb") as f:
        index = 0
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            
            checksum = calculate_checksum(chunk)
            yield index, chunk, checksum
            index += 1