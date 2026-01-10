from fastapi import APIRouter, Request, Header, HTTPException
from app.webapp.dependencies import SessionDep
from app.services.payment_service import PaymentService

router = APIRouter()
payment_service = PaymentService()

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: SessionDep = None # Injection manuelle si besoin
):
    """
    Reçoit les événements Stripe (Paiement réussi, Abonnement annulé).
    Vérifie la signature cryptographique pour la sécurité.
    """
    payload = await request.body()
    
    try:
        # On passe la session manuellement car c'est un webhook externe
        # Note: SessionDep ne marche pas toujours bien ici sans middleware spécifique
        # Dans un cas réel, on instancierait une nouvelle session ici.
        payment_service.handle_webhook(db, payload, stripe_signature)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"status": "success"}