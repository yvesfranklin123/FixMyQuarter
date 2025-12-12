import socket
import json
import base64
import logging
from typing import List
from sqlalchemy.orm import Session
from ..node_code.protocol import Message, CommandPayload
from ..database import models

logger = logging.getLogger("storage.replication")

def send_chunk_to_node(node_ip: str, port: int, chunk_id: str, data: bytes) -> bool:
    """
    Envoie physiquement un chunk à un NodeAgent via TCP.
    """
    try:
        # Encodage Base64 pour le protocole JSON
        b64_data = base64.b64encode(data).decode('utf-8')
        
        payload = CommandPayload(
            command="store_chunk",
            args=[chunk_id, b64_data]
        )
        
        msg = Message(type="CMD", payload=payload.__dict__)
        
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(10) # Timeout de 10s pour l'envoi
            s.connect((node_ip, port))
            
            # Envoi (avec newline comme délimiteur)
            s.sendall((msg.to_json() + "\n").encode('utf-8'))
            
            # Attente réponse
            response_data = s.recv(4096).decode('utf-8')
            response_json = json.loads(response_data)
            
            # Analyse réponse
            if response_json.get("type") == "RESP":
                resp_payload = response_json.get("payload", {})
                if resp_payload.get("status") == "OK":
                    return True
                else:
                    logger.error(f"Node {node_ip} error: {resp_payload.get('message')}")
            else:
                logger.error(f"Node {node_ip} protocol error: {response_json}")
                
            return False
            
    except Exception as e:
        logger.error(f"Failed to send chunk to {node_ip}: {e}")
        return False

def get_chunk_from_node(node_ip: str, port: int, chunk_id: str) -> bytes:
    """
    Récupère physiquement un chunk depuis un NodeAgent.
    """
    try:
        payload = CommandPayload(command="read_chunk", args=[chunk_id])
        msg = Message(type="CMD", payload=payload.__dict__)
        
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(10)
            s.connect((node_ip, port))
            s.sendall((msg.to_json() + "\n").encode('utf-8'))
            
            # Lecture bufferisée (le chunk peut être gros)
            response_data = ""
            while True:
                chunk = s.recv(4096)
                if not chunk:
                    break
                response_data += chunk.decode('utf-8')
                if "\n" in response_data and response_data.strip().endswith("}"):
                    # Fin potentielle du JSON (simplifié)
                    break
            
            try:
                response_json = json.loads(response_data)
            except json.JSONDecodeError:
                # Si le buffer est coupé, c'est un risque ici. 
                # Dans une version prod, il faut un vrai framer.
                # Pour l'instant on suppose que small chunks passent.
                return None

            if response_json.get("type") == "RESP":
                resp_payload = response_json.get("payload", {})
                if resp_payload.get("status") == "OK":
                    b64_data = resp_payload.get("data")
                    return base64.b64decode(b64_data)
    except Exception as e:
        logger.error(f"Failed to get chunk from {node_ip}: {e}")
    return None

def delete_chunk_on_node(node_ip: str, port: int, chunk_id: str):
    try:
        payload = CommandPayload(command="rm", args=[chunk_id])
        msg = Message(type="CMD", payload=payload.__dict__)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)
            s.connect((node_ip, port))
            s.sendall((msg.to_json() + "\n").encode('utf-8'))
    except Exception:
        pass