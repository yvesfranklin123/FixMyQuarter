import socket
import os
import json
import threading
import logging
from .orchestrator import ContainerOrchestrator
from .monitor import Monitor

logger = logging.getLogger("orchestrator.ipc")

SOCKET_PATH = "/tmp/orchestrator.sock"

class IPCServer(threading.Thread):
    def __init__(self, orchestrator: ContainerOrchestrator, monitor: Monitor):
        super().__init__()
        self.orchestrator = orchestrator
        self.monitor = monitor
        self.running = True

    def run(self):
        if os.path.exists(SOCKET_PATH):
            os.remove(SOCKET_PATH)
        
        server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        server.bind(SOCKET_PATH)
        os.chmod(SOCKET_PATH, 0o666) # Allow webapp user to write
        server.listen(5)
        
        logger.info(f"IPC Server listening on {SOCKET_PATH}")
        
        while self.running:
            try:
                conn, _ = server.accept()
                with conn:
                    data = conn.recv(4096)
                    if not data:
                        continue
                    
                    request = json.loads(data.decode())
                    response = self.handle_request(request)
                    
                    conn.sendall(json.dumps(response).encode())
            except Exception as e:
                logger.error(f"IPC Error: {e}")
        
        server.close()
        if os.path.exists(SOCKET_PATH):
            os.remove(SOCKET_PATH)

    def handle_request(self, req: dict):
        action = req.get("action")
        
        try:
            if action == "create_node":
                return self.orchestrator.create_node(
                    req["node_id"], req["ip"], req["cpu"], req["mem"]
                )
            elif action == "stop_node":
                return self.orchestrator.stop_node(req["node_id"])
            elif action == "get_stats":
                # Combine cgroup stats + heartbeat info
                cgroup_stats = self.orchestrator.get_node_stats(req["node_id"])
                mon_nodes = self.monitor.get_nodes()
                node_mon = mon_nodes.get(req["node_id"], {})
                return {**cgroup_stats, "status": node_mon.get("status", "UNKNOWN")}
            elif action == "list_nodes":
                return self.monitor.get_nodes()
            else:
                return {"error": "Unknown action"}
        except Exception as e:
            logger.error(f"Action failed: {e}")
            return {"error": str(e)}

    def stop(self):
        self.running = False
        # Connect to self to unblock accept()
        try:
            client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            client.connect(SOCKET_PATH)
            client.close()
        except:
            pass