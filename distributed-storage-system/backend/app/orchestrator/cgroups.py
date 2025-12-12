import os
import logging

logger = logging.getLogger("orchestrator.cgroups")

CGROUP_ROOT = "/sys/fs/cgroup/storage_system"

def init_cgroup_root():
    """Crée la racine cgroup et active les controlleurs."""
    if not os.path.exists(CGROUP_ROOT):
        try:
            os.makedirs(CGROUP_ROOT)
            # Active cpu et memory pour les enfants
            subtree_path = os.path.join(CGROUP_ROOT, "cgroup.subtree_control")
            with open(subtree_path, "w") as f:
                f.write("+cpu +memory")
            logger.info("Cgroup root initialized.")
        except Exception as e:
            logger.error(f"Failed to init cgroup root: {e}")

def create_cgroup(node_id: str, cpu_quota_percent: int, memory_mb: int):
    """Crée un cgroup pour un nœud spécifique."""
    path = os.path.join(CGROUP_ROOT, node_id)
    os.makedirs(path, exist_ok=True)

    # CPU Limit (Format: quota period)
    # 100% = 100000 100000
    if cpu_quota_percent:
        quota = int(cpu_quota_percent * 1000) # ex: 20% -> 20000
        period = 100000
        try:
            with open(os.path.join(path, "cpu.max"), "w") as f:
                f.write(f"{quota} {period}")
        except IOError as e:
            logger.error(f"Failed to set CPU limit for {node_id}: {e}")

    # Memory Limit
    if memory_mb:
        limit_bytes = memory_mb * 1024 * 1024
        try:
            with open(os.path.join(path, "memory.max"), "w") as f:
                f.write(str(limit_bytes))
        except IOError as e:
            logger.error(f"Failed to set Memory limit for {node_id}: {e}")

    return path

def add_process_to_cgroup(node_id: str, pid: int):
    """Ajoute un PID au cgroup."""
    path = os.path.join(CGROUP_ROOT, node_id, "cgroup.procs")
    try:
        with open(path, "w") as f:
            f.write(str(pid))
    except IOError as e:
        logger.error(f"Failed to add PID {pid} to cgroup {node_id}: {e}")

def remove_cgroup(node_id: str):
    """Supprime le cgroup (après arrêt des processus)."""
    path = os.path.join(CGROUP_ROOT, node_id)
    if os.path.exists(path):
        try:
            os.rmdir(path)
        except OSError as e:
            logger.error(f"Could not remove cgroup {node_id}: {e}")

def get_cgroup_stats(node_id: str) -> dict:
    """Lit les métriques actuelles."""
    path = os.path.join(CGROUP_ROOT, node_id)
    stats = {"cpu_usage_usec": 0, "memory_current": 0}
    
    if not os.path.exists(path):
        return stats

    try:
        with open(os.path.join(path, "cpu.stat"), "r") as f:
            for line in f:
                if line.startswith("usage_usec"):
                    stats["cpu_usage_usec"] = int(line.split()[1])
                    break
        
        with open(os.path.join(path, "memory.current"), "r") as f:
            stats["memory_current"] = int(f.read().strip())
            
    except Exception:
        pass
    
    return stats