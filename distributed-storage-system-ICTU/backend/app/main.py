import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError

# Imports internes
from app.core.config import settings
from app.core.exceptions import CustomException
from app.webapp.main import api_router # Le routeur principal qui regroupe tout
from app.database.redis import redis_client

# --- CONFIGURATION LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("NexusCloud")

# --- LIFESPAN (Cycle de vie) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Démarrage de {settings.PROJECT_NAME} version {settings.PROJECT_VERSION}")
    try:
        # Test de connexion Redis
        if await redis_client.ping():
            logger.info("✅ Connexion Redis : OK")
    except Exception as e:
        logger.critical(f"❌ Échec critique connexion Redis : {e}")
    
    yield 
    
    logger.info("🛑 Arrêt du système en cours...")
    try:
        await redis_client.close()
        logger.info("✅ Connexion Redis fermée proprement")
    except Exception as e:
        logger.error(f"⚠️ Erreur lors de la fermeture Redis : {e}")

# --- METADATA DOCUMENTATION ---
tags_metadata = [
    {"name": "Authentication", "description": "Login, Register, Refresh Token & 2FA."},
    {"name": "Drive - Files", "description": "Upload, Download, Stream & File Management."},
    {"name": "Drive - Folders", "description": "Structure arborescente."},
    {"name": "Admin", "description": "Superuser dashboard & Node management."},
]

# --- INITIALISATION APP ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="**NexusCloud API** - Système de stockage distribué décentralisé.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# --- MIDDLEWARES (Ordre optimisé) ---

# 1. Trusted Host
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS or ["*"]
)

# 2. GZip (Compression)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. CORS (Cross-Origin Resource Sharing)
# Important : Doit être configuré avant d'inclure les routes
origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Middleware de Monitoring (Temps de réponse)
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f"{process_time_ms}ms"
    return response

# --- GESTION DES ERREURS ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"⚠️ Validation Error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Données invalides",
            "errors": exc.errors(),
        },
    )

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"🔥 UNHANDLED EXCEPTION: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Erreur interne du système."},
    )

# --- ROUTAGE ---
# api_router contient déjà auth.router, users.router, etc. via app/webapp/main.py
app.include_router(api_router, prefix=settings.API_V1_STR)

# --- HEALTH CHECK ---
@app.get("/health", tags=["Monitoring"])
def health_check():
    return {
        "status": "active",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }