from typing import Optional
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer")
    expires_in: int

class RefreshToken(BaseModel):
    refresh_token: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None # L'ID ou Email de l'utilisateur
    type: str = "access"
    exp: int