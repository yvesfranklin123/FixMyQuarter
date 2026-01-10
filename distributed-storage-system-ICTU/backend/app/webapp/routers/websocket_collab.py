from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict

router = APIRouter()

class ConnectionManager:
    """Gère les connexions actives par document"""
    def __init__(self):
        # Map: doc_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, doc_id: str):
        await websocket.accept()
        if doc_id not in self.active_connections:
            self.active_connections[doc_id] = []
        self.active_connections[doc_id].append(websocket)

    def disconnect(self, websocket: WebSocket, doc_id: str):
        if doc_id in self.active_connections:
            self.active_connections[doc_id].remove(websocket)
            if not self.active_connections[doc_id]:
                del self.active_connections[doc_id]

    async def broadcast(self, message: str, doc_id: str, sender: WebSocket):
        """Envoie le message à tous sauf l'émetteur"""
        if doc_id in self.active_connections:
            for connection in self.active_connections[doc_id]:
                if connection != sender:
                    await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/doc/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: str):
    """
    Endpoint WebSocket pour l'édition collaborative.
    Utilise le protocole Yjs ou OT (Operational Transformation).
    """
    await manager.connect(websocket, doc_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Relais simple du delta de modification aux autres clients
            await manager.broadcast(data, doc_id, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, doc_id)
        # On pourrait notifier les autres que "User X est parti"