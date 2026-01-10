from datetime import datetime
from pydantic import BaseModel, Field

class DiskUsage(BaseModel):
    total: int # Bytes
    used: int
    free: int
    percent: float

class SystemResources(BaseModel):
    cpu_percent: float = Field(ge=0, le=100)
    ram_percent: float = Field(ge=0, le=100)
    disk: DiskUsage
    network_rx_mb: float
    network_tx_mb: float

class NodeHealth(BaseModel):
    node_id: str
    status: str = Field(..., pattern="^(online|offline|critical)$")
    ip_address: str
    latency_ms: float
    last_seen: datetime
    metrics: SystemResources