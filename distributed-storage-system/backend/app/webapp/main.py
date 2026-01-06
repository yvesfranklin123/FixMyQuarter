from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import grpc
from app import node_pb2
from app import node_pb2_grpc

app = FastAPI()

# Configuration CORS pour le Frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À sécuriser en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration gRPC
GRPC_SERVER = 'localhost:50051'

def get_grpc_stub():
    """Crée une connexion temporaire vers le service gRPC"""
    channel = grpc.insecure_channel(GRPC_SERVER)
    return node_pb2_grpc.NodeControllerStub(channel)

@app.get("/")
def read_root():
    return {"system": "Distributed Storage", "status": "running", "mode": "Microservices (gRPC)"}

@app.get("/nodes")
def list_nodes():
    """Récupère la liste des nœuds via gRPC"""
    try:
        stub = get_grpc_stub()
        # Appel gRPC
        response = stub.ListNodes(node_pb2.Empty())
        
        # Conversion Protobuf -> JSON pour le frontend
        nodes_json = []
        for node in response.nodes:
            nodes_json.append({
                "id": node.node_id,
                "ip": node.ip_address,
                "status": node.status,
                "max_capacity": f"{node.max_capacity_gb} GB",
                "used_capacity": node.used_capacity_gb,
                "is_full": node.is_full
            })
        return nodes_json
    except grpc.RpcError as e:
        raise HTTPException(status_code=503, detail=f"Service gRPC indisponible: {e.details()}")

@app.post("/nodes/provision")
def provision_node(node_id: str, ip: str, max_size_gb: int = 10):
    """Demande la création d'un nœud via gRPC"""
    try:
        stub = get_grpc_stub()
        request = node_pb2.CreateNodeRequest(
            node_id=node_id, 
            ip_address=ip, 
            max_capacity_gb=max_size_gb
        )
        
        response = stub.CreateNode(request)
        
        if not response.success:
            raise HTTPException(status_code=400, detail=response.message)
            
        return {"message": response.message, "node_id": node_id}
        
    except grpc.RpcError as e:
        raise HTTPException(status_code=503, detail=f"Erreur gRPC: {e.details()}")