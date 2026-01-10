from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class Plan(BaseModel):
    id: str # 'free', 'pro', 'biz'
    name: str
    storage_limit_gb: int
    price_monthly: float
    currency: str = "EUR"
    features: list[str]

class SubscriptionStatus(BaseModel):
    plan: Plan
    status: str # 'active', 'canceled', 'past_due'
    current_period_end: datetime
    cancel_at_period_end: bool
    invoice_pdf_url: Optional[str]