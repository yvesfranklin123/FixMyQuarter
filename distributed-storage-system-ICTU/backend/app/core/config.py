import secrets
from typing import List, Union, Optional, Any
from pydantic import AnyHttpUrl, EmailStr, field_validator, PostgresDsn, RedisDsn, ValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # --- CONFIGURATION GÉNÉRALE ---
    PROJECT_NAME: str = "NexusCloud"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "production"  # local, staging, production
    
    # --- SÉCURITÉ ---
    # Si SECRET_KEY n'est pas fourni dans .env, on en génère une aléatoire (sûr pour le dev)
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    # Durée de vie des tokens (en minutes)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # --- RÉSEAU & CORS ---
    # CRUCIAL : Liste des hôtes autorisés (TrustedHostMiddleware)
    # Empêche l'erreur "Settings object has no attribute ALLOWED_HOSTS"
    ALLOWED_HOSTS: List[str] = ["*"]

    # Liste des origines autorisées (Frontend, Applications mobiles...)
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # --- BASE DE DONNÉES (PostgreSQL) ---
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int = 5432
    
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if isinstance(v, str):
            return v
        
        # Construction dynamique de l'URL
        return PostgresDsn.build(
            scheme="postgresql",
            username=info.data.get("POSTGRES_USER"),
            password=info.data.get("POSTGRES_PASSWORD"),
            host=info.data.get("POSTGRES_SERVER"),
            port=info.data.get("POSTGRES_PORT"),
            path=info.data.get("POSTGRES_DB"),
        )

    # --- REDIS (Cache & PubSub) ---
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_URL: Optional[RedisDsn] = None

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_url(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if v: return v
        
        return RedisDsn.build(
            scheme="redis",
            host=info.data.get("REDIS_HOST"),
            port=info.data.get("REDIS_PORT"),
            password=info.data.get("REDIS_PASSWORD"),
            path=f"/{info.data.get('REDIS_DB')}"
        )

    # --- STOCKAGE DISTRIBUÉ ---
    STORAGE_ROOT: str = "/data/containers"
    REPLICATION_FACTOR: int = 3  # Nombre de copies par fichier
    MIN_NODES_REQUIRED: int = 2

    # --- UTILISATEUR INITIAL ---
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    # --- SERVICES EXTERNES ---
    STRIPE_API_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    
    # --- CONFIGURATION DU FICHIER .ENV ---
    model_config = SettingsConfigDict(
        case_sensitive=True, 
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore" # Ignore les variables .env non déclarées ici pour éviter les crashs
    )

settings = Settings()