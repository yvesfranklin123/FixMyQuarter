from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    stripe_customer_id = Column(String, index=True)
    stripe_subscription_id = Column(String, index=True)
    
    plan_name = Column(String) # 'pro_100gb', 'business_1tb'
    status = Column(String) # 'active', 'past_due', 'canceled'
    current_period_end = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="subscription")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True) # Stripe Invoice ID
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float) # En devise locale
    currency = Column(String, default="eur")
    status = Column(String) # 'succeeded', 'failed'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())