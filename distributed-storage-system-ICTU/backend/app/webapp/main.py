from fastapi import APIRouter
from app.webapp.routers import (
    auth,
    users,
    drive,
    folders,
    sharing,
    admin,
    search,
    webhooks,
    websocket_collab,
    notifications
)

# Initialisation unique du routeur principal
api_router = APIRouter()

# --- 1. ACCÈS & IDENTITÉ ---
# Gère le login, register, et le profil utilisateur
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users Profile"])

# --- 2. MAILLAGE DE STOCKAGE (DRIVE) ---
# Drive : Gère les fragments physiques (upload, download, files)
# URL finale : /api/v1/drive/...
api_router.include_router(drive.router, prefix="/drive", tags=["Drive - Files"])

# Folders : Gère l'arborescence logique et les secteurs (dossiers)
# URL finale : /api/v1/folders
api_router.include_router(folders.router, prefix="/folders", tags=["Drive - Folders"])

# --- 3. FLUX & COLLABORATION ---
# Partages publics et synchronisation temps réel via WebSockets
api_router.include_router(sharing.router, prefix="/share", tags=["Sharing"])
api_router.include_router(websocket_collab.router, prefix="/ws", tags=["Real-time Collaboration"])

# --- 4. SERVICES DE DONNÉES ---
# Moteur de recherche et centre de notifications
api_router.include_router(search.router, prefix="/search", tags=["Search Engine"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# --- 5. INFRASTRUCTURE & FACTURATION ---
# Panel admin et Webhooks (Stripe/Paiements)
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks & Billing"])