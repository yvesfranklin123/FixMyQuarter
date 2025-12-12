import socket
import threading
import time
import sys
import os
import json

# Add current directory to path to allow relative imports if run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .shell import Shell
from .protocol import Message

HOST = '0.0.0.0'
PORT = 9999
MONITOR_IP = '10.10.0.1'  # Gateway IP where orchestrator/monitor listens
MONITOR_PORT = 5005

class NodeAgent:
    def __init__(self):
        self.shell = Shell()
        self.running = True
        self.node_id = os.environ.get("NODE_ID", "unknown_node")

    def start_heartbeat(self):
        """Sends UDP ping to monitor every 5 seconds"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        while self.running:
            try:
                msg = json.dumps({"node_id": self.node_id, "status": "ALIVE", "timestamp": time.time()})
                sock.sendto(msg.encode(), (MONITOR_IP, MONITOR_PORT))
            except Exception as e:
                print(f"Heartbeat error: {e}")
            time.sleep(5)

    def handle_client(self, conn, addr):
        print(f"Connected by {addr}")
        with conn:
            buffer = ""
            while True:
                data = conn.recv(4096)
                if not data:
                    break
                
                buffer += data.decode('utf-8')
                
                # Simple delimiter handling (newline)
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    if not line.strip():
                        continue
                        
                    try:
                        msg = Message.from_json(line)
                        response = self.shell.execute(msg)
                        conn.sendall((response.to_json() + "\n").encode('utf-8'))
                    except Exception as e:
                        err = Message(type="ERR", payload=f"Protocol Error: {str(e)}")
                        conn.sendall((err.to_json() + "\n").encode('utf-8'))

    def start_server(self):
        # Start Heartbeat in background
        hb_thread = threading.Thread(target=self.start_heartbeat, daemon=True)
        hb_thread.start()

        # Start TCP Server
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((HOST, PORT))
            s.listen()
            print(f"🚀 Agent running on {HOST}:{PORT} (ID: {self.node_id})")
            
            while self.running:
                try:
                    conn, addr = s.accept()
                    client_thread = threading.Thread(target=self.handle_client, args=(conn, addr))
                    client_thread.start()
                except Exception as e:
                    print(f"Server error: {e}")

if __name__ == "__main__":
    agent = NodeAgent()
    agent.start_server()