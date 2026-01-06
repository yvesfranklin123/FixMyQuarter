import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

# --- CALCUL DU CHEMIN ABSOLU VERS .env ---
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(backend_dir)
env_path = os.path.join(project_root, ".env")

class Settings(BaseSettings):
    # --- Security ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ROOT_PASSWORD: Optional[str] = None

    # --- Database ---
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Network Infrastructure ---
    BRIDGE_INTERFACE: str = "br0"
    NETWORK_SUBNET: str = "10.10.0.0/24"
    GATEWAY_IP: str = "10.10.0.1"
    
    # --- Storage & System ---
    BASE_DIR: str = backend_dir
    ROOTFS_BASE_PATH: str = "./data/rootfs_base"
    CONTAINERS_PATH: str = "./data/containers"
    
    DEFAULT_USER_QUOTA_MB: int = 500
    CHUNK_SIZE_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=env_path, 
        env_file_encoding='utf-8',
        extra="ignore"
    )

    @property
    def CHUNK_SIZE_BYTES(self) -> int:
        return self.CHUNK_SIZE_MB * 1024 * 1024

settings = Settings()