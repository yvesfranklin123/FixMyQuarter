import stripe
import logging
from typing import Optional, Dict, Any
# C'est l'import qui manquait et qui causait votre erreur :
from sqlalchemy.orm import Session 
from fastapi import HTTPException

from app.core.config import settings
from app.database import models
from datetime import datetime, timedelta

logger = logging.getLogger("NexusCloud.Payment")

class PaymentService:
    def __init__(self):
        # Initialisation de Stripe avec les clés de config
        stripe.api_key = settings.STRIPE_API_KEY
        self.webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    def create_checkout_session(self, db: Session, user: models.User, price_id: str) -> str:
        """
        Crée une session de paiement Stripe pour un abonnement.
        Retourne l'URL de redirection vers Stripe.
        """
        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=user.email,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=f"{settings.BACKEND_CORS_ORIGINS[0]}/dashboard?success=true",
                cancel_url=f"{settings.BACKEND_CORS_ORIGINS[0]}/pricing?canceled=true",
                metadata={
                    "user_id": user.id
                }
            )
            return checkout_session.url
        except Exception as e:
            logger.error(f"Stripe Checkout Error: {e}")
            raise HTTPException(status_code=400, detail="Impossible d'initialiser le paiement.")

    def handle_webhook(self, db: Session, payload: bytes, sig_header: str):
        """
        Gère les événements envoyés par Stripe (Paiement réussi, etc.)
        Sécurisé par signature cryptographique.
        """
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
        except ValueError as e:
            # Payload invalide
            logger.error(f"Invalid payload: {e}")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            # Signature invalide
            logger.error(f"Invalid signature: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # Traitement des événements
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self._handle_checkout_completed(db, session)
        
        elif event['type'] == 'invoice.payment_succeeded':
            # Renouvellement automatique
            pass
            
        elif event['type'] == 'customer.subscription.deleted':
            # Désabonnement
            pass

        return {"status": "success"}

    def _handle_checkout_completed(self, db: Session, session: Dict[str, Any]):
        """Active l'abonnement de l'utilisateur après paiement réussi."""
        user_id = session.get("metadata", {}).get("user_id")
        if not user_id:
            logger.warning("Webhook received without user_id in metadata")
            return

        logger.info(f"💰 Payment success for User {user_id}")
        
        # Logique métier : Mettre à jour le quota de l'utilisateur
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        if user:
            # Exemple : Passage au plan PRO (1TB)
            # Dans un vrai cas, on vérifierait le price_id pour savoir quel plan activer
            user.storage_limit = 1024 * 1024 * 1024 * 1024 # 1 TB
            db.commit()