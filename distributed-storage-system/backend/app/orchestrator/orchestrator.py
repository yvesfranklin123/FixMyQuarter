import os
import subprocess
import logging
import shutil
import signal
from app.config import settings

logger = logging.getLogger("orchestrator")
logging.basicConfig(level=logging.INFO)

class NodeManager:
    """
    Gère le cycle de vie des nœuds de stockage (Conteneurs Linux natifs).
    Utilise Namespaces et Cgroups.
    """

    def __init__(self):
        self.containers_path = settings.CONTAINERS_PATH
        self.rootfs_base = settings.ROOTFS_BASE_PATH

    def _run_command(self, cmd: list):
        """Exécute une commande système sécurisée."""
        try:
            logger.info(f"EXEC: {' '.join(cmd)}")
            # check=True lève une erreur si la commande échoue
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except subprocess.CalledProcessError as e:
            logger.error(f"Erreur commande: {e.stderr.decode()}")
            raise e

    def create_node(self, node_id: str, ip_address: str):
        """Crée un environnement isolé pour un nœud."""
        node_path = os.path.join(self.containers_path, node_id)
        
        # 1. Préparation du Filesystem
        if not os.path.exists(node_path):
            os.makedirs(node_path)
            logger.info(f"Création du dossier pour le nœud {node_id}")

        # 2. Création du Network Namespace
        self._run_command(["ip", "netns", "add", node_id])

        # 3. Création de la paire veth (Virtual Ethernet)
        veth_host = f"veth_{node_id}"[:15]
        veth_peer = f"vpeer_{node_id}"[:15]
        
        self._run_command([
            "ip", "link", "add", veth_host, "type", "veth", "peer", "name", veth_peer
        ])

        # 4. Déplacement de l'interface peer dans le namespace du nœud
        self._run_command(["ip", "link", "set", veth_peer, "netns", node_id])

        # 5. Configuration IP dans le namespace
        self._run_command([
            "ip", "netns", "exec", node_id, 
            "ip", "addr", "add", f"{ip_address}/24", "dev", veth_peer
        ])
        
        self._run_command([
            "ip", "netns", "exec", node_id, "ip", "link", "set", veth_peer, "up"
        ])
        
        # 6. Attacher le côté hôte au Bridge
        self._run_command(["ip", "link", "set", veth_host, "master", settings.BRIDGE_INTERFACE])
        self._run_command(["ip", "link", "set", veth_host, "up"])

        logger.info(f"Nœud {node_id} démarré avec IP {ip_address}")

    def stop_node(self, node_id: str):
        """Arrête le nœud en supprimant son isolation réseau."""
        try:
            logger.info(f"Arrêt du nœud {node_id}...")
            # Supprimer le namespace supprime automatiquement les veth peers
            self._run_command(["ip", "netns", "del", node_id])
            return True
        except Exception as e:
            logger.error(f"Erreur lors de l'arrêt du nœud {node_id} : {e}")
            return False

    # --- MÉTHODE AJOUTÉE POUR LA SUPPRESSION COMPLÈTE ---
    def delete_node(self, node_id: str):
        """
        Supprime définitivement un nœud :
        1. Nettoyage du Network Namespace (Réseau).
        2. Suppression de l'interface hôte résiduelle.
        3. Suppression physique des données sur le disque.
        """
        logger.info(f"Destruction complète du nœud {node_id} en cours...")
        
        # 1. On tente d'abord d'arrêter le réseau
        self.stop_node(node_id)

        # 2. Suppression de l'interface veth côté hôte (si elle existe encore)
        veth_host = f"veth_{node_id}"[:15]
        try:
            # On vérifie si l'interface existe avant de supprimer
            subprocess.run(["ip", "link", "show", veth_host], check=True, capture_output=True)
            self._run_command(["ip", "link", "delete", veth_host])
            logger.info(f"Interface hôte {veth_host} nettoyée.")
        except subprocess.CalledProcessError:
            # L'interface a probablement déjà été supprimée par le 'netns del'
            pass

        # 3. Suppression définitive des données sur le disque
        node_path = os.path.join(self.containers_path, node_id)
        if os.path.exists(node_path):
            try:
                shutil.rmtree(node_path)
                logger.info(f"Répertoire de données {node_path} supprimé.")
            except Exception as e:
                logger.error(f"Impossible de supprimer le dossier {node_path}: {e}")
                raise e

        logger.info(f"Nœud {node_id} totalement purgé du système.")
        return {"status": "success", "node_id": node_id}