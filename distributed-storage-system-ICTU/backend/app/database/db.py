from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# --- CONFIGURATION DU MOTEUR SQL ---
# Utilisation de l'URL PostgreSQL définie dans config.py
# En cas de SQLite (dev), on désactive check_same_thread
connect_args = {"check_same_thread": False} if "sqlite" in str(settings.SQLALCHEMY_DATABASE_URI) else {}

engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    # Optimisation du Pool de Connexions
    pool_pre_ping=True,      # Vérifie si la connexion est vivante avant de l'utiliser
    pool_size=20,            # Nombre de connexions maintenues ouvertes
    max_overflow=10,         # Connexions supplémentaires temporaires autorisées
    pool_recycle=3600,       # Recycle les connexions toutes les heures
    connect_args=connect_args,
    echo=False               # Mettre à True pour voir le SQL brut dans les logs (Debug uniquement)
)

# Factory de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Gestionnaire de contexte pour les sessions DB.
    Utilisé par FastAPI via Depends(get_db).
    Garantit la fermeture de la session même en cas de crash.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Erreur Database Session: {e}")
        db.rollback()
        raise
    finally:
        db.close()