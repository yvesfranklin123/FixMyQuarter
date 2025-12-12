import sys
import os
import logging

# Add the parent directory (backend) to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.db import engine, SessionLocal
from app.database.models import Base, User
from app.config import settings
from app.webapp.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

    # Create Admin User if not exists
    admin_user = db.query(User).filter(User.role == "admin").first()
    if not admin_user:
        logger.info("Creating default admin user...")
        password = settings.ROOT_PASSWORD or "admin"
        hashed_password = get_password_hash(password)
        
        user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            role="admin",
            is_active=True,
            quota_limit=100 * 1024 * 1024 * 1024  # 100 GB for admin
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Admin created. Username: admin, Password: {password}")
    else:
        logger.info("Admin user already exists.")

def main():
    logger.info("Initializing Database...")
    db = SessionLocal()
    try:
        init_db(db)
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    main()