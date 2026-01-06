@router.post("/nodes/provision")
def provision_node(node_id: str, ip: str):
    # Connexion gRPC
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = node_pb2_grpc.NodeManagerStub(channel)
        response = stub.CreateNode(CreateNodeRequest(node_id=node_id, ip=ip))
        
    if not response.success:
        raise HTTPException(status_code=400, detail=response.message)
    return {"status": "success"}