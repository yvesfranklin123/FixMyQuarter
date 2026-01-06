import os
import tempfile
from app.storage_logic import chunker

def create_temp_file(content: bytes) -> str:
    """Helper pour créer un fichier temporaire."""
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(content)
        return tmp.name

def test_calculate_checksum():
    data = b"test data"
    # SHA256 de "test data"
    expected = "916f0027a575074ce72a331777c3478d6513f786a591bd892da1a577bf2335f9"
    assert chunker.calculate_checksum(data) == expected

def test_file_chunker_exact_size():
    # 10 bytes
    content = b"0123456789"
    file_path = create_temp_file(content)
    
    try:
        # Chunk size de 5 bytes -> Doit donner 2 chunks
        # Note: on appelle file_chunker, pas iter_chunks
        chunks = list(chunker.file_chunker(file_path, chunk_size=5))
        
        assert len(chunks) == 2
        # Vérif chunk 1 : index 0, données "01234"
        assert chunks[0][0] == 0
        assert chunks[0][1] == b"01234"
        
        # Vérif chunk 2 : index 1, données "56789"
        assert chunks[1][0] == 1
        assert chunks[1][1] == b"56789"
        
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

def test_file_chunker_remainder():
    # 12 bytes
    content = b"0123456789AB"
    file_path = create_temp_file(content)
    
    try:
        # Chunk size de 5 bytes -> 3 chunks (5, 5, 2)
        chunks = list(chunker.file_chunker(file_path, chunk_size=5))
        
        assert len(chunks) == 3
        assert chunks[2][1] == b"AB"
        
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

def test_file_chunker_empty():
    file_path = create_temp_file(b"")
    try:
        chunks = list(chunker.file_chunker(file_path, chunk_size=5))
        assert len(chunks) == 0
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)