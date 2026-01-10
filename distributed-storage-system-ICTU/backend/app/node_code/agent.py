import asyncio
import grpc
import logging
import signal
from concurrent import futures

# Import des définitions Protobuf (générées)
from app.protos import node_pb2, node_pb2_grpc
from .dedup import DedupEngine

# Configuration
PORT = 50051
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("NodeAgent")

class NodeService(node_pb2_grpc.StorageNodeServicer):
    """
    Implémentation du service gRPC défini dans node.proto.
    """
    def __init__(self):
        self.engine = DedupEngine()

    async def HealthCheck(self, request, context):
        """Ping simple pour le Load Balancer"""
        return node_pb2.HealthResponse(status="SERVING", disk_free=1024*1024*1024) # TODO: Vrai check disk

    async def UploadBlock(self, request_iterator, context):
        """
        Reçoit un stream de chunks, les assemble et écrit le bloc.
        C'est ici que la magie du streaming opère.
        """
        data_buffer = bytearray()
        
        # Lecture du stream entrant
        async for chunk in request_iterator:
            data_buffer.extend(chunk.data)

        # Écriture via le moteur de déduplication
        try:
            content_hash, is_new, size = await self.engine.write_block(bytes(data_buffer))
            
            return node_pb2.UploadResponse(
                success=True,
                hash=content_hash,
                bytes_written=size,
                is_duplicate=not is_new
            )
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            return node_pb2.UploadResponse(success=False, error_message=str(e))

    async def DownloadBlock(self, request, context):
        """
        Lit un bloc et le stream vers le client.
        """
        try:
            data = await self.engine.read_block(request.hash)
            
            # Découpage en chunks pour le réseau (Max 4MB pour gRPC)
            CHUNK_SIZE = 1024 * 1024 * 2 # 2MB
            for i in range(0, len(data), CHUNK_SIZE):
                chunk = data[i : i + CHUNK_SIZE]
                yield node_pb2.FileChunk(data=chunk)
                
        except FileNotFoundError:
            await context.abort(grpc.StatusCode.NOT_FOUND, "Block not found")
        except Exception as e:
            logger.error(f"Download Error: {e}")
            await context.abort(grpc.StatusCode.INTERNAL, str(e))

async def serve():
    """Démarre le serveur gRPC"""
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    node_pb2_grpc.add_StorageNodeServicer_to_server(NodeService(), server)
    
    server.add_insecure_port(f'[::]:{PORT}')
    logger.info(f"🚀 Node Agent starting on port {PORT}...")
    
    await server.start()
    
    # Gestion de l'arrêt gracieux (SIGTERM pour Kubernetes)
    async def shutdown():
        logger.info("Stopping Node Agent...")
        await server.stop(5)

    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, lambda: asyncio.create_task(shutdown()))
    
    await server.wait_for_termination()

if __name__ == "__main__":
    asyncio.run(serve())