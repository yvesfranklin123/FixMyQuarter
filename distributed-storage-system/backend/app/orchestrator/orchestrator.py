import os
import shutil
import time
import logging
import subprocess
from ..config import settings
from . import namespaces, cgroups, network

logger = logging.getLogger("orchestrator.core")

class ContainerOrchestrator:
    def __init__(self):
        self.active_containers = {} # {node_id: pid}
        self._init_system()

    def _init_system(self):
        cgroups.init_cgroup_root()
        network.setup_bridge(settings.BRIDGE_INTERFACE, f"{settings.GATEWAY_IP}/24")
        if not os.path.exists(settings.CONTAINERS_PATH):
            os.makedirs(settings.CONTAINERS_PATH)

    def create_node(self, node_id: str, ip: str, cpu_limit: int, mem_limit: int):
        logger.info(f"Creating node {node_id} at {ip}")
        
        # 1. Prepare RootFS
        node_root = os.path.join(settings.CONTAINERS_PATH, node_id)
        if os.path.exists(node_root):
            shutil.rmtree(node_root)
        
        # Copy base image (Naive COW)
        shutil.copytree(settings.ROOTFS_BASE_PATH, node_root)
        
        # Inject Node Code (Agent)
        app_dir = os.path.join(node_root, "app")
        if os.path.exists(app_dir):
            shutil.rmtree(app_dir)
            
        # Locate source code (backend/app/node_code)
        src_code = os.path.join(settings.BASE_DIR, "app", "node_code")
        shutil.copytree(src_code, app_dir)

        # 2. Start Process (Unshare)
        cmd = ["/usr/bin/python3", "/app/agent.py"]
        env = {"NODE_ID": node_id, "PYTHONUNBUFFERED": "1"}
        
        proc = namespaces.run_process_in_isolation(node_root, cmd, env)
        
        # Wait a bit for namespace creation
        time.sleep(0.5) 
        
        if proc.poll() is not None:
            stdout, stderr = proc.communicate()
            raise Exception(f"Container failed to start immediately: {stderr.decode()}")

        pid = proc.pid
        self.active_containers[node_id] = pid
        logger.info(f"Node {node_id} started with PID {pid}")

        # 3. Setup Cgroups
        cgroups.create_cgroup(node_id, cpu_limit, mem_limit)
        cgroups.add_process_to_cgroup(node_id, pid)

        # 4. Setup Network
        network.setup_node_network(node_id, pid, ip, settings.BRIDGE_INTERFACE, settings.GATEWAY_IP)

        return {"status": "started", "pid": pid}

    def stop_node(self, node_id: str):
        if node_id in self.active_containers:
            pid = self.active_containers[node_id]
            logger.info(f"Stopping node {node_id} (PID {pid})")
            
            # Kill process
            try:
                os.kill(pid, 15) # SIGTERM
                time.sleep(1)
                os.kill(pid, 9)  # SIGKILL
            except ProcessLookupError:
                pass
            
            del self.active_containers[node_id]

        # Cleanup System Resources
        network.cleanup_network(node_id)
        cgroups.remove_cgroup(node_id)
        
        # Cleanup FS
        node_root = os.path.join(settings.CONTAINERS_PATH, node_id)
        if os.path.exists(node_root):
            shutil.rmtree(node_root)
            
        return {"status": "stopped"}

    def get_node_stats(self, node_id: str):
        return cgroups.get_cgroup_stats(node_id)