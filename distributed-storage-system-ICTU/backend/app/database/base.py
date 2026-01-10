from typing import Any
from datetime import datetime
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import MetaData, Column, DateTime
from sqlalchemy.sql import func

# --- 1. CONVENTION DE NOMMAGE STRICTE ---
# Indispensable pour la compatibilité Alembic / PostgreSQL
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)

@as_declarative(metadata=metadata)
class Base:
    id: Any
    __name__: str

    # Génération automatique du nom de la table en snake_case (User -> users)
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"

class TimestampMixin:
    """Mixin pour ajouter automatiquement created_at et updated_at"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )