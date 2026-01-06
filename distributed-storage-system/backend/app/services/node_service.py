import grpc
from concurrent import futures
import sys
import os

# Ajout des chemins pour les imports
sys.path.append(os.getcwd())

from app import node_pb2
from app import node_pb2_grpc
from app.orchestrator.orchestrator import NodeManager

# Simulation d'une base de données en mémoire pour l'état des nodes
NODE_DB = {}

class NodeServiceServer(node_pb2_grpc.NodeControllerServicer):
    def __init__(self):
        self.manager = NodeManager()
        print("✅ Service Node gRPC initialisé.")

    def CreateNode(self, request, context):
        node_id = request.node_id
        
        if node_id in NODE_DB:
            return node_pb2.NodeResponse(success=False, message=f"Le nœud {node_id} existe déjà.")

        try:
            # Appel à l'orchestrateur système (Linux)
            self.manager.create_node(node_id, request.ip_address)
            
            NODE_DB[node_id] = {
                "ip": request.ip_address,
                "max_gb": request.max_capacity_gb,
                "used_gb": 0.0,
                "status": "ONLINE"
            }
            
            return node_pb2.NodeResponse(success=True, message="Nœud provisionné avec succès.")
            
        except Exception as e:
            print(f"Erreur création node: {e}")
            return node_pb2.NodeResponse(success=False, message=str(e))

    # --- MÉTHODE AJOUTÉE POUR LA SUPPRESSION ---
    def DeleteNode(self, request, context):
        """
        Supprime un nœud du cluster gRPC et nettoie le système Linux.
        """
        node_id = request.node_id
        
        if node_id not in NODE_DB:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"Nœud {node_id} introuvable.")
            return node_pb2.NodeResponse(success=False, message="Nœud inexistant.")

        try:
            print(f"🧨 Suppression du nœud {node_id} via gRPC...")
            
            # 1. Appel au NodeManager pour détruire le NetNS et les fichiers
            # Utilise la méthode delete_node que nous avons ajoutée au NodeManager
            self.manager.delete_node(node_id)
            
            # 2. Suppression de la base de données en mémoire
            del NODE_DB[node_id]
            
            return node_pb2.NodeResponse(success=True, message=f"Nœud {node_id} supprimé physiquement.")
            
        except Exception as e:
            print(f"Erreur lors de la suppression gRPC: {e}")
            return node_pb2.NodeResponse(success=False, message=f"Erreur système: {str(e)}")

    def ListNodes(self, request, context):
        response = node_pb2.NodeList()
        for node_id, data in NODE_DB.items():
            is_full = data["used_gb"] >= data["max_gb"]
            info = node_pb2.NodeInfo(
                node_id=node_id,
                ip_address=data["ip"],
                status=data["status"],
                max_capacity_gb=data["max_gb"],
                used_capacity_gb=data["used_gb"],
                is_full=is_full
            )
            response.nodes.append(info)
        return response

    def GetNodeStatus(self, request, context):
        node_id = request.node_id
        if node_id not in NODE_DB:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details('Node not found')
            return node_pb2.NodeInfo()
            
        data = NODE_DB[node_id]
        return node_pb2.NodeInfo(
            node_id=node_id,
            ip_address=data["ip"],
            status=data["status"],
            max_capacity_gb=data["max_gb"],
            used_capacity_gb=data["used_gb"],
            is_full=(data["used_gb"] >= data["max_gb"])
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    node_pb2_grpc.add_NodeControllerServicer_to_server(NodeServiceServer(), server)
    
    server.add_insecure_port('[::]:50051')
    print("🚀 Serveur gRPC Node démarré sur le port 50051")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()