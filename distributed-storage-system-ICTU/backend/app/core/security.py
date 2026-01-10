from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
from passlib.context import CryptContext
import pyotp  # Pour le 2FA
import secrets

from app.core.config import settings

# Contexte de hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crée un JWT d'accès court terme"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any]) -> str:
    """Crée un JWT de rafraîchissement long terme"""
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe brut correspond au hash (avec troncature de sécurité)"""
    # Troncature à 72 octets pour éviter le crash de Bcrypt
    safe_password = plain_password.encode('utf-8')[:72].decode('utf-8', 'ignore')
    return pwd_context.verify(safe_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hache le mot de passe avant stockage (avec troncature de sécurité)"""
    # On limite à 72 octets pour la compatibilité Bcrypt et on évite le ValueError
    safe_password = password.encode('utf-8')[:72].decode('utf-8', 'ignore')
    return pwd_context.hash(safe_password)

# --- LOGIQUE 2FA (Double Authentification) ---

def generate_2fa_secret() -> str:
    """Génère une clé secrète unique pour l'utilisateur"""
    return pyotp.random_base32()

def verify_2fa_code(secret: str, code: str) -> bool:
    """Vérifie le code à 6 chiffres (ex: Google Authenticator)"""
    totp = pyotp.TOTP(secret)
    return totp.verify(code)

def generate_api_key() -> str:
    """Génère une clé API sécurisée (pour les scripts ou SDK)"""
    return f"nk_{secrets.token_urlsafe(32)}"