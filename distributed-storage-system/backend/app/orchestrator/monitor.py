import socket
import threading
import json
import logging
import time

logger = logging.getLogger("orchestrator.monitor")

class Monitor(threading.Thread):
    def __init__(self, host="0.0.0.0", port=5005):
        super().__init__()
        self.host = host
        self.port = port
        self.running = True
        self.node_statuses = {} # {node_id: {last_seen: timestamp, status: 'ALIVE'}}
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((self.host, self.port))
        self.sock.settimeout(1.0) # Non-blockingish

    def run(self):
        logger.info(f"Monitor listening on UDP {self.host}:{self.port}")
        while self.running:
            try:
                data, addr = self.sock.recvfrom(1024)
                message = json.loads(data.decode())
                
                node_id = message.get("node_id")
                status = message.get("status")
                
                if node_id:
                    self.node_statuses[node_id] = {
                        "last_seen": time.time(),
                        "status": status,
                        "ip": addr[0]
                    }
                    # logger.debug(f"Heartbeat from {node_id}")
            except socket.timeout:
                continue
            except Exception as e:
                logger.error(f"Monitor error: {e}")

    def get_nodes(self):
        # Prune dead nodes or mark them
        now = time.time()
        result = {}
        for nid, info in self.node_statuses.items():
            if now - info["last_seen"] > 15:
                info["status"] = "OFFLINE"
            result[nid] = info
        return result

    def stop(self):
        self.running = False
        self.sock.close()