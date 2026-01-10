from app.workers.celery_app import celery_app

class NotificationService:
    @staticmethod
    def send_email_async(to_email: str, subject: str, content: str):
        """Envoie la tâche au worker Celery"""
        celery_app.send_task(
            "worker.send_email",
            args=[to_email, subject, content]
        )

    @staticmethod
    async def push_websocket_update(user_id: int, message: dict):
        """Notifie le frontend en temps réel via Redis PubSub"""
        from app.database.redis import redis_client
        await redis_client.publish(f"user:{user_id}", str(message))