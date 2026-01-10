from pydantic import BaseModel, Field
from typing import List

class Enable2FAResponse(BaseModel):
    otp_uri: str = Field(..., description="URI standard pour générer le QR Code")
    secret: str = Field(..., description="Clé secrète manuelle")

class Verify2FARequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")

class BackupCodes(BaseModel):
    codes: List[str]
    warning: str = "Conservez ces codes en lieu sûr. Ils ne s'afficheront qu'une fois."