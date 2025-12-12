from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import engine
from app.database import models

# Import des routeurs (seront créés dans l'étape suivante)
from app.webapp.routers import auth, nodes, files, monitoring, websocket

# Création automatique des tables au démarrage (pour le dev)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Distributed Storage System API",
    description="API for managing custom containers and distributed storage.",
    version="1.0.0"
)

# Configuration CORS (Indispensable pour que le Frontend Next.js port 3000 puisse parler au Backend port 8000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(nodes.router, prefix="/nodes", tags=["Nodes"])
app.include_router(files.router, prefix="/files", tags=["Files"])
app.include_router(monitoring.router, prefix="/monitor", tags=["Monitoring"])
app.include_router(websocket.router, prefix="/ws", tags=["Realtime"])

@app.get("/")
def health_check():
    return {"status": "ok", "system": "Distributed Storage System v1.0"}