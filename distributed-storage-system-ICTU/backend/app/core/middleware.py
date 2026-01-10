import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging

logger = logging.getLogger("nexus.middleware")

class ProcessTimeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        
        # Ajoute le temps de traitement dans le header de réponse
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        return response

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Récupère l'ID du client ou en génère un nouveau
        correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        # On injecte l'ID dans l'état de la requête pour les logs
        request.state.correlation_id = correlation_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = correlation_id
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Implémentation simpliste. 
    En production, utilisez Redis pour compter les requêtes par IP.
    """
    def __init__(self, app: ASGIApp, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {} # {ip: [timestamps]}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host
        current_time = time.time()
        
        # Nettoyage et vérification
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Garder seulement les requêtes dans la fenêtre de temps
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] 
            if current_time - t < self.window_seconds
        ]
        
        if len(self.requests[client_ip]) >= self.max_requests:
            return Response("Too Many Requests", status_code=429)
        
        self.requests[client_ip].append(current_time)
        return await call_next(request)