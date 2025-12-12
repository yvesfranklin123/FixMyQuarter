import os
import json
import hashlib
import time
import shutil

STORAGE_ROOT = "/storage"
METADATA_FILE = os.path.join(STORAGE_ROOT, "metadata.json")

class StorageEngine:
    def __init__(self):
        self._ensure_storage()
        self.metadata = self._load_metadata()

    def _ensure_storage(self):
        if not os.path.exists(STORAGE_ROOT):
            os.makedirs(STORAGE_ROOT)

    def _load_metadata(self):
        if os.path.exists(METADATA_FILE):
            try:
                with open(METADATA_FILE, 'r') as f:
                    return json.load(f)
            except:
                return {"chunks": {}, "used_bytes": 0}
        return {"chunks": {}, "used_bytes": 0}

    def _save_metadata(self):
        with open(METADATA_FILE, 'w') as f:
            json.dump(self.metadata, f)

    def store_chunk(self, chunk_id: str, data: bytes) -> dict:
        file_path = os.path.join(STORAGE_ROOT, chunk_id)
        
        with open(file_path, 'wb') as f:
            f.write(data)
        
        sha256_hash = hashlib.sha256(data).hexdigest()
        size = len(data)

        self.metadata["chunks"][chunk_id] = {
            "size": size,
            "checksum": sha256_hash,
            "created_at": time.time()
        }
        self.metadata["used_bytes"] = self._calculate_used_bytes()
        self._save_metadata()

        return {"chunk_id": chunk_id, "checksum": sha256_hash, "size": size}

    def get_chunk(self, chunk_id: str) -> bytes:
        if chunk_id not in self.metadata["chunks"]:
            raise FileNotFoundError(f"Chunk {chunk_id} not found")
        
        file_path = os.path.join(STORAGE_ROOT, chunk_id)
        with open(file_path, 'rb') as f:
            return f.read()

    def delete_chunk(self, chunk_id: str):
        if chunk_id in self.metadata["chunks"]:
            file_path = os.path.join(STORAGE_ROOT, chunk_id)
            if os.path.exists(file_path):
                os.remove(file_path)
            del self.metadata["chunks"][chunk_id]
            self.metadata["used_bytes"] = self._calculate_used_bytes()
            self._save_metadata()
            return True
        return False

    def _calculate_used_bytes(self):
        total = 0
        for info in self.metadata["chunks"].values():
            total += info["size"]
        return total

    def get_stats(self):
        total, used, free = shutil.disk_usage(STORAGE_ROOT)
        return {
            "disk_total": total,
            "disk_used_os": used,
            "disk_free": free,
            "app_used_bytes": self.metadata["used_bytes"],
            "chunk_count": len(self.metadata["chunks"])
        }