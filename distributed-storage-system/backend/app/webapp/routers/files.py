from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import hashlib
from io import BytesIO

from app.database import models, schemas
from app.webapp import dependencies
from app.config import settings
from app.storage_logic import chunker, placement, replication

router = APIRouter()

@router.post("/upload", response_model=schemas.FileResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    file_content = await file.read()
    file_size = len(file_content)

    if current_user.quota_used + file_size > current_user.quota_limit:
        raise HTTPException(status_code=400, detail="Quota exceeded")

    file_checksum = hashlib.sha256(file_content).hexdigest()
    
    db_file = models.File(
        filename=file.filename,
        size=file_size,
        checksum=file_checksum,
        user_id=current_user.id,
        status="PROCESSING"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    try:
        f_obj = BytesIO(file_content)
        
        for index, chunk_hash, chunk_data in chunker.iter_chunks(f_obj):
            chunk_id = f"{db_file.id}_{index}_{str(uuid.uuid4())[:8]}"
            
            nodes = placement.select_best_nodes(db, replication_factor=2, required_size=len(chunk_data))
            if not nodes:
                raise Exception("Not enough available nodes")

            db_chunk = models.FileChunk(
                id=chunk_id,
                file_id=db_file.id,
                chunk_index=index,
                size=len(chunk_data),
                checksum=chunk_hash
            )
            db.add(db_chunk)
            
            for i, node in enumerate(nodes):
                success = replication.send_chunk_to_node(node.ip_address, node.port, chunk_id, chunk_data)
                if success:
                    loc = models.ChunkLocation(
                        chunk_id=chunk_id,
                        node_id=node.id,
                        is_primary=(i == 0)
                    )
                    db.add(loc)
                    
                    node.used_capacity += len(chunk_data)
        
        db_file.status = "UPLOADED"
        current_user.quota_used += file_size
        
        audit = models.AuditLog(
            user_id=current_user.id,
            action="UPLOAD_FILE",
            details={"file_id": db_file.id, "size": file_size}
        )
        db.add(audit)
        db.commit()
        
    except Exception as e:
        db.rollback()
        db_file.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    return db_file

@router.get("/", response_model=List[schemas.FileResponse])
def list_files(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.File).filter(models.File.user_id == current_user.id).all()

@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_file = db.query(models.File).filter(models.File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if db_file.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    def file_iterator():
        sorted_chunks = sorted(db_file.chunks, key=lambda c: c.chunk_index)
        for chunk in sorted_chunks:
            data = None
            for loc in chunk.locations:
                if loc.node.status == "ONLINE":
                    data = replication.get_chunk_from_node(loc.node.ip_address, loc.node.port, chunk.id)
                    if data:
                        break
            
            if data:
                yield data
            else:
                raise Exception(f"Chunk {chunk.id} missing")

    audit = models.AuditLog(
        user_id=current_user.id,
        action="DOWNLOAD_FILE",
        details={"file_id": file_id}
    )
    db.add(audit)
    db.commit()

    return StreamingResponse(
        file_iterator(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={db_file.filename}"}
    )

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_file = db.query(models.File).filter(models.File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for chunk in db_file.chunks:
        for loc in chunk.locations:
            replication.delete_chunk_on_node(loc.node.ip_address, loc.node.port, chunk.id)

    current_user.quota_used -= db_file.size
    db.delete(db_file)
    db.commit()

    return {"status": "deleted"}