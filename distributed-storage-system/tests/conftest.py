import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ajout du dossier backend au sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/backend")

from app.config import settings
from app.database.db import Base, get_db
from app.webapp.main import app

# Configuration d'une DB en mémoire pour les tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    # Override des settings pour éviter de toucher au vrai système
    settings.ROOTFS_BASE_PATH = "/tmp/test_rootfs"
    settings.CONTAINERS_PATH = "/tmp/test_containers"
    settings.CHUNK_SIZE_MB = 1  # 1MB pour les tests

@pytest.fixture(scope="function")
def db_session():
    # Création des tables
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    # Suppression des tables après le test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c