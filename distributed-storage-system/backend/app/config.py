import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

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
    NODE_IP_RANGE_START: str = "10.10.0.10"
    NODE_IP_RANGE_END: str = "10.10.0.200"

    # --- Storage & System ---
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Remonte d'un niveau pour sortir de 'app' et atteindre 'backend'
    
    ROOTFS_BASE_PATH: str = "./data/rootfs_base"
    CONTAINERS_PATH: str = "./data/containers"
    
    DEFAULT_USER_QUOTA_MB: int = 500
    CHUNK_SIZE_MB: int = 10

    # Configuration Pydantic pour lire le fichier .env
    model_config = SettingsConfigDict(
        env_file="../.env",  # Cherche le .env à la racine du projet
        env_file_encoding="utf-8",
        extra="ignore" # Ignore les variables .env non déclarées ici
    )

    @property
    def CHUNK_SIZE_BYTES(self) -> int:
        return self.CHUNK_SIZE_MB * 1024 * 1024

    @property
    def DEFAULT_USER_QUOTA_BYTES(self) -> int:
        return self.DEFAULT_USER_QUOTA_MB * 1024 * 1024

# Instance unique de configuration
settings = Settings()