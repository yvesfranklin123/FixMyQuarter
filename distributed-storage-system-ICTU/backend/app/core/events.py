import asyncio
from typing import Callable, Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class EventType:
    FILE_UPLOADED = "file_uploaded"
    FILE_DELETED = "file_deleted"
    USER_REGISTERED = "user_registered"
    NODE_OFFLINE = "node_offline"
    VIRUS_DETECTED = "virus_detected"

class EventBus:
    """
    Système Pub/Sub asynchrone interne.
    """
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        """Abonne une fonction à un événement"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.info(f"EventBus: Handler subscribed to {event_type}")

    async def publish(self, event_type: str, payload: Any):
        """Publie un événement et exécute les handlers en background"""
        if event_type not in self._subscribers:
            return

        handlers = self._subscribers[event_type]
        logger.info(f"EventBus: Publishing {event_type} to {len(handlers)} handlers")

        # Exécuter tous les handlers sans bloquer l'appelant principal
        # On utilise asyncio.gather pour le parallélisme
        tasks = [self._safe_execute(handler, payload) for handler in handlers]
        await asyncio.gather(*tasks)

    async def _safe_execute(self, handler: Callable, payload: Any):
        """Exécute un handler en attrapant les erreurs pour ne pas crasher le bus"""
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(payload)
            else:
                handler(payload)
        except Exception as e:
            logger.error(f"EventBus Error in handler {handler.__name__}: {str(e)}")

# Instance globale (Singleton)
event_bus = EventBus()