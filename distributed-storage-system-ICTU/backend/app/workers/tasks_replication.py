import grpc
from celery.utils.log import get_task_logger
from app.workers.celery_app import celery_app
from app.protos import node_pb2, node_pb2_grpc
from app.database import models
from app.database.db import SessionLocal

logger = get_task_logger(__name__)

@celery_app.task(bind=True, queue="system", max_retries=5)
def replicate_block(self, file_id: str, source_node_ip: str, target_node_ip: str):
    """
    Copie un bloc de données d'un Node A vers un Node B.
    Utilise le stream gRPC pour transférer les données directement.
    """
    logger.info(f"♻️ Replicating {file_id} from {source_node_ip} to {target_node_ip}")
    
    try:
        # 1. Connexion au Node Source (Téléchargement)
        source_channel = grpc.insecure_channel(source_node_ip)
        source_stub = node_pb2_grpc.StorageNodeStub(source_channel)
        
        # Récupération du hash du fichier (via DB)
        db = SessionLocal()
        file = db.query(models.File).get(file_id)
        content_hash = file.content_hash
        db.close()

        # Stream de lecture
        download_iterator = source_stub.DownloadBlock(node_pb2.DownloadRequest(hash=content_hash))

        # 2. Connexion au Node Cible (Upload)
        target_channel = grpc.insecure_channel(target_node_ip)
        target_stub = node_pb2_grpc.StorageNodeStub(target_channel)
        
        # Fonction génératrice pour adapter le stream Download -> Upload
        def stream_generator():
            for chunk in download_iterator:
                yield node_pb2.FileChunk(data=chunk.data)

        # Envoi au node cible
        response = target_stub.UploadBlock(stream_generator())
        
        if not response.success:
            raise Exception(f"Target node rejected upload: {response.error_message}")
            
        logger.info(f"✅ Replication success: {file_id}")

    except Exception as e:
        logger.error(f"Replication failed: {e}")
        # Retry avec backoff exponentiel pour laisser le temps au réseau de revenir
        raise self.retry(exc=e, countdown=2 ** self.request.retries)