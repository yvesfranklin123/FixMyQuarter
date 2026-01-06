import sys
import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient

# --- 1. CONFIGURATION DU CHEMIN (PATH) ---
# On ajoute le dossier 'backend' au chemin de recherche de Python
# pour qu'il puisse trouver "app"
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# --- 2. IMPORTS CORRIGÉS ---
# Attention : 'database' et 'main' sont dans 'app.webapp', pas juste 'app'
from app.config import settings
from app.webapp.database.db import Base, get_db, engine
from app.webapp.main import app as fastapi_app

# --- 3. FIXTURES PYTEST ---

@pytest.fixture(scope="session")
def db_engine():
    """Crée le moteur de base de données pour les tests."""
    # On utilise SQLite en mémoire ou fichier pour les tests
    return engine

@pytest.fixture(scope="function")
def db(db_engine):
    """
    Crée une nouvelle session de base de données pour chaque test.
    Crée les tables avant le test et les supprime après.
    """
    # Crée les tables
    Base.metadata.create_all(bind=db_engine)
    
    # Prépare la session
    from sqlalchemy.orm import sessionmaker
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    
    yield session
    
    # Nettoyage après le test
    session.close()
    Base.metadata.drop_all(bind=db_engine)

@pytest.fixture(scope="function")
def client(db):
    """
    Crée un client de test FastAPI qui utilise la DB de test.
    Surcharge la dépendance get_db pour utiliser la session de test.
    """
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    # Nettoyage de l'override après le test
    fastapi_app.dependency_overrides.clear()