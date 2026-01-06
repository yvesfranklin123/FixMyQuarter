from sqlalchemy import create_engine
# Changement ici : on importe declarative_base depuis orm
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# check_same_thread est nécessaire uniquement pour SQLite
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Utilisation de la nouvelle méthode
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()