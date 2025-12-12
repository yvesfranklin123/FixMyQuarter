import subprocess
import os
import logging

logger = logging.getLogger("orchestrator.namespaces")

def run_process_in_isolation(rootfs_path: str, cmd_list: list, env: dict = None) -> subprocess.Popen:
    """
    Lance un processus isolé via unshare.
    Utilise: PID, NET, MNT, UTS, IPC namespaces.
    Monte /proc.
    """
    
    # Commande unshare pour créer les namespaces
    # --fork : Fork le programme spécifié comme processus enfant
    # --pid : Unshare PID namespace
    # --mount-proc : Monte /proc avant de lancer la commande (crucial pour ps, top)
    # --net, --uts, --ipc : Isolation réseau, hostname, IPC
    base_cmd = [
        "unshare",
        "--fork",
        "--pid",
        "--mount-proc",
        "--net",
        "--uts",
        "--ipc",
        "--mount", # Mount namespace
        "chroot", rootfs_path # Change la racine
    ]

    # Combine la commande de base avec la commande à exécuter dans le conteneur
    full_cmd = base_cmd + cmd_list
    
    # Environnement par défaut
    run_env = env if env else os.environ.copy()
    run_env["HOME"] = "/root"
    run_env["PATH"] = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

    logger.info(f"Starting isolated process: {' '.join(full_cmd)}")
    
    process = subprocess.Popen(
        full_cmd,
        env=run_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        stdin=subprocess.PIPE # Pour éviter que le processus ne vole le stdin du daemon
    )
    
    return process

def run_netns_command(pid: int, cmd_list: list):
    """
    Exécute une commande réseau DANS le namespace d'un processus existant (via nsenter).
    Utilisé pour configurer l'IP depuis l'hôte.
    """
    nsenter_cmd = [
        "nsenter",
        "-t", str(pid), # Cible le PID
        "-n",           # Entre dans le namespace Network
    ] + cmd_list

    try:
        subprocess.run(nsenter_cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Netns command failed: {e.stderr.decode()}")
        raise