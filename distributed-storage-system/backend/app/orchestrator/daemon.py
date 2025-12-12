import time
import logging
import sys
import os

# Ensure backend path is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.config import settings
from app.orchestrator.orchestrator import ContainerOrchestrator
from app.orchestrator.monitor import Monitor
from app.orchestrator.ipc_server import IPCServer

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/system.log")
    ]
)

logger = logging.getLogger("orchestrator.daemon")

def main():
    if os.geteuid() != 0:
        logger.error("Orchestrator must run as ROOT to manage containers.")
        sys.exit(1)

    logger.info("Starting Distributed Storage Orchestrator...")
    
    # 1. Init Core Logic
    orchestrator = ContainerOrchestrator()
    
    # 2. Start Monitor (UDP Heartbeats)
    monitor = Monitor()
    monitor.start()
    
    # 3. Start IPC Server (Communication with Web API)
    ipc = IPCServer(orchestrator, monitor)
    ipc.start()
    
    logger.info("System Ready. Waiting for commands.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        monitor.stop()
        ipc.stop()
        monitor.join()
        ipc.join()
        logger.info("Goodbye.")

if __name__ == "__main__":
    main()