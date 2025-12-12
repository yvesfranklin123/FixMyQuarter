import subprocess
import logging
import time
from .namespaces import run_netns_command

logger = logging.getLogger("orchestrator.network")

def setup_bridge(bridge_name="br0", gateway_ip="10.10.0.1/24"):
    """S'assure que le bridge existe sur l'hôte."""
    try:
        # Check if exists
        subprocess.run(["ip", "link", "show", bridge_name], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        logger.info(f"Creating bridge {bridge_name}")
        subprocess.run(["ip", "link", "add", "name", bridge_name, "type", "bridge"], check=True)
        subprocess.run(["ip", "addr", "add", gateway_ip, "dev", bridge_name], check=True)
        subprocess.run(["ip", "link", "set", bridge_name, "up"], check=True)
        
        # Enable IP forwarding
        subprocess.run(["sysctl", "-w", "net.ipv4.ip_forward=1"], check=True)
        
        # Setup NAT (Masquerade)
        subprocess.run(["iptables", "-t", "nat", "-A", "POSTROUTING", "-s", gateway_ip, "-j", "MASQUERADE"], check=False)

def setup_node_network(node_id: str, pid: int, ip_addr: str, bridge="br0", gateway="10.10.0.1"):
    """
    Configure le réseau veth pour un conteneur.
    1. Crée la paire veth sur l'hôte.
    2. Attache un bout au bridge.
    3. Envoie l'autre bout dans le namespace du PID.
    4. Configure l'IP à l'intérieur via nsenter.
    """
    
    # Noms des interfaces (limit 15 chars)
    veth_host = f"veth{node_id[:8]}"
    veth_peer = "vpeer" # Nom temporaire avant déplacement
    
    try:
        # 1. Clean old if exists
        subprocess.run(["ip", "link", "del", veth_host], stderr=subprocess.DEVNULL, check=False)

        # 2. Create pair
        subprocess.run(["ip", "link", "add", veth_host, "type", "veth", "peer", "name", veth_peer], check=True)

        # 3. Attach host side to bridge
        subprocess.run(["ip", "link", "set", veth_host, "master", bridge], check=True)
        subprocess.run(["ip", "link", "set", veth_host, "up"], check=True)

        # 4. Move peer to container namespace
        subprocess.run(["ip", "link", "set", veth_peer, "netns", str(pid)], check=True)

        # 5. Configure inside container (rename to eth0, add IP, add route)
        # Rename vpeer -> eth0
        run_netns_command(pid, ["ip", "link", "set", "dev", veth_peer, "name", "eth0"])
        # Add IP
        run_netns_command(pid, ["ip", "addr", "add", f"{ip_addr}/24", "dev", "eth0"])
        # Up
        run_netns_command(pid, ["ip", "link", "set", "eth0", "up"])
        # Up lo
        run_netns_command(pid, ["ip", "link", "set", "lo", "up"])
        # Default Route
        run_netns_command(pid, ["ip", "route", "add", "default", "via", gateway])

        logger.info(f"Network configured for {node_id}: {ip_addr}")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Network setup failed for {node_id}: {e}")
        raise

def cleanup_network(node_id: str):
    veth_host = f"veth{node_id[:8]}"
    subprocess.run(["ip", "link", "del", veth_host], stderr=subprocess.DEVNULL, check=False)