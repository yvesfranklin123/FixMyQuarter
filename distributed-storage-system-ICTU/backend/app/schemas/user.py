from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, computed_field

# --- BASE ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

# --- INPUTS ---
class UserCreate(UserBase):
    # Ajout de max_length=72 pour protéger l'algorithme Bcrypt (Backend)
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=72, 
        description="Le mot de passe doit contenir entre 8 et 72 caractères"
    )

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    # Protection également sur la mise à jour
    password: Optional[str] = Field(None, min_length=8, max_length=72)
    is_active: Optional[bool] = None

# --- OUTPUTS ---
class User(UserBase):
    id: int
    public_id: str
    is_superuser: bool
    is_2fa_enabled: bool
    storage_limit: int
    used_storage: int
    created_at: datetime
    
    # Configuration Pydantic v2 pour lire depuis SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def storage_percent(self) -> float:
        """Champ calculé à la volée pour le frontend"""
        if self.storage_limit <= 0: 
            return 0.0
        return round((self.used_storage / self.storage_limit) * 100, 2)

class UserInDB(User):
    hashed_password: str # Usage interne seulement