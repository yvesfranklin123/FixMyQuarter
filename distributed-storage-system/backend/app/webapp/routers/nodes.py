from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import models, schemas
from app.webapp import dependencies
from app.config import settings
from app.webapp.ipc_client import ipc_client

router = APIRouter()

@router.post("/", response_model=schemas.NodeResponse)
def create_node(
    node_in: schemas.NodeCreate,
    current_user: models.User = Depends(dependencies.get_current_admin_user),
    db: Session = Depends(dependencies.get_db)
):
    existing = db.query(models.Node).filter(models.Node.id == node_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Node ID already exists")

    count = db.query(models.Node).count()
    ip_suffix = 10 + count
    ip_address = f"10.10.0.{ip_suffix}"

    response = ipc_client.send_command(
        "create_node",
        node_id=node_in.name,
        ip=ip_address,
        cpu=node_in.cpu_limit,
        mem=node_in.mem_limit
    )

    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"])

    new_node = models.Node(
        id=node_in.name,
        ip_address=ip_address,
        cpu_limit=node_in.cpu_limit,
        mem_limit=node_in.mem_limit,
        total_capacity=10 * 1024 * 1024 * 1024 
    )
    db.add(new_node)
    
    audit = models.AuditLog(
        user_id=current_user.id,
        action="CREATE_NODE",
        details={"node_id": node_in.name, "ip": ip_address}
    )
    db.add(audit)
    db.commit()
    db.refresh(new_node)
    
    return new_node

@router.get("/", response_model=List[schemas.NodeResponse])
def list_nodes(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    nodes = db.query(models.Node).all()
    
    monitor_data = ipc_client.send_command("list_nodes")
    
    for node in nodes:
        if isinstance(monitor_data, dict) and node.id in monitor_data:
            node.status = monitor_data[node.id].get("status", "UNKNOWN")
    
    return nodes

@router.post("/{node_id}/stop")
def stop_node(
    node_id: str,
    current_user: models.User = Depends(dependencies.get_current_admin_user),
    db: Session = Depends(dependencies.get_db)
):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    response = ipc_client.send_command("stop_node", node_id=node_id)
    if response.get("error"):
        raise HTTPException(status_code=500, detail=response["error"])

    node.status = "OFFLINE"
    db.commit()
    return {"status": "success"}

@router.get("/{node_id}/stats")
def get_node_stats(
    node_id: str,
    current_user: models.User = Depends(dependencies.get_current_user)
):
    stats = ipc_client.send_command("get_stats", node_id=node_id)
    if stats.get("error"):
        raise HTTPException(status_code=404, detail="Stats unavailable")
    return stats