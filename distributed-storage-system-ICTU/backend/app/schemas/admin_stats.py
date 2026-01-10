from pydantic import BaseModel
from typing import List, Dict

class GrowthPoint(BaseModel):
    date: str
    count: int

class StorageDistribution(BaseModel):
    images: int
    videos: int
    documents: int
    others: int

class AdminDashboardStats(BaseModel):
    # KPIs Globaux
    total_users: int
    active_users_24h: int
    total_storage_used_gb: float
    total_revenue_mrr: float
    
    # Infra
    nodes_total: int
    nodes_online: int
    
    # Graphiques (Listes de points)
    user_growth: List[GrowthPoint]
    storage_growth: List[GrowthPoint]
    
    # Camembert
    file_type_distribution: Dict[str, int]