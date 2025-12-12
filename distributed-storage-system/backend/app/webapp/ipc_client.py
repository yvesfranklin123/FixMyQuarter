import socket
import json
import os
import logging

logger = logging.getLogger(__name__)

SOCKET_PATH = "/tmp/orchestrator.sock"

class IPCClient:
    def send_command(self, action: str, **kwargs) -> dict:
        """
        Envoie une commande JSON au Daemon Orchestrator (Root) via le socket Unix.
        """
        if not os.path.exists(SOCKET_PATH):
            return {"error": "Orchestrator daemon is not running (socket not found)."}

        payload = {"action": action, **kwargs}
        
        try:
            # Connexion au socket Unix
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
                client.settimeout(5) # Timeout de 5 secondes
                client.connect(SOCKET_PATH)
                
                # Envoi de la commande
                client.sendall(json.dumps(payload).encode('utf-8'))
                
                # Réception de la réponse
                response_data = client.recv(4096 * 4) # Buffer large
                if not response_data:
                    return {"error": "Empty response from daemon"}
                
                return json.loads(response_data.decode('utf-8'))
                
        except socket.timeout:
            return {"error": "Connection to orchestrator timed out."}
        except ConnectionRefusedError:
            return {"error": "Connection refused. Is the daemon running?"}
        except Exception as e:
            logger.error(f"IPC Client Error: {e}")
            return {"error": str(e)}

# Instance singleton pour utilisation facile
ipc_client = IPCClient()