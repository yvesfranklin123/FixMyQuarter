import time
import grpc
import os
import sys
import json
from datetime import datetime

# Ajout des chemins pour importer les protos générés
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
from app.protos import node_pb2, node_pb2_grpc

NODES = os.getenv("STORAGE_NODES", "localhost:50051,localhost:50052").split(",")

class CustomMonitor:
    def __init__(self):
        print(f"🕵️  Monitor Agent démarré. Surveillance de : {NODES}")

    def collect_metrics(self):
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "cluster_status": "healthy",
            "nodes": []
        }

        for target in NODES:
            try:
                # Connexion gRPC rapide (timeout 2s)
                channel = grpc.insecure_channel(target)
                stub = node_pb2_grpc.StorageNodeStub(channel)
                response = stub.HealthCheck(node_pb2.Empty(), timeout=2)
                
                node_data = {
                    "target": target,
                    "status": response.status,
                    "disk_free_gb": round(response.disk_free / (1024**3), 2),
                    "cpu_load": round(response.cpu_usage, 1)
                }
                report["nodes"].append(node_data)
                
            except Exception as e:
                report["cluster_status"] = "degraded"
                report["nodes"].append({"target": target, "status": "OFFLINE", "error": str(e)})
                print(f"⚠️  ALERTE: Node {target} ne répond pas!")

        return report

    def run(self):
        while True:
            metrics = self.collect_metrics()
            # Affichage "Dashboard" dans les logs
            print(f"📊 METRICS [{metrics['timestamp']}] Status: {metrics['cluster_status']}")
            print(json.dumps(metrics, indent=2))
            
            # Ici, on pourrait insérer dans une table SQL 'historical_metrics'
            time.sleep(10)

if __name__ == "__main__":
    monitor = CustomMonitor()
    monitor.run()