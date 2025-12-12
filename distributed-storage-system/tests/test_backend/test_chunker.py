import io
import hashlib
from app.storage_logic import chunker

def test_calculate_checksum():
    data = b"hello world"
    expected_hash = hashlib.sha256(data).hexdigest()
    assert chunker.calculate_checksum(data) == expected_hash

def test_iter_chunks_exact_size():
    # Crée un fichier simulé de 10 bytes
    content = b"0123456789"
    file_obj = io.BytesIO(content)
    
    # Chunk size de 5 bytes -> Doit donner 2 chunks
    chunks = list(chunker.iter_chunks(file_obj, chunk_size=5))
    
    assert len(chunks) == 2
    
    idx1, hash1, data1 = chunks[0]
    assert idx1 == 0
    assert data1 == b"01234"
    assert hash1 == hashlib.sha256(b"01234").hexdigest()
    
    idx2, hash2, data2 = chunks[1]
    assert idx2 == 1
    assert data2 == b"56789"

def test_iter_chunks_remainder():
    # 12 bytes
    content = b"0123456789AB"
    file_obj = io.BytesIO(content)
    
    # Chunk size de 5 bytes -> 3 chunks (5, 5, 2)
    chunks = list(chunker.iter_chunks(file_obj, chunk_size=5))
    
    assert len(chunks) == 3
    assert len(chunks[2][2]) == 2  # Le dernier fait 2 bytes
    assert chunks[2][2] == b"AB"

def test_iter_chunks_empty():
    file_obj = io.BytesIO(b"")
    chunks = list(chunker.iter_chunks(file_obj, chunk_size=5))
    assert len(chunks) == 0