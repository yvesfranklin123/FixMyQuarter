import os
import shutil
from .storage import StorageEngine, STORAGE_ROOT
from .protocol import encode_data, decode_data

storage = StorageEngine()

def cmd_mkdir(args):
    if not args:
        return "Error: Missing directory name"
    path = os.path.join(STORAGE_ROOT, args[0].lstrip('/'))
    try:
        os.makedirs(path, exist_ok=True)
        return f"Directory {args[0]} created"
    except Exception as e:
        return f"Error: {str(e)}"

def cmd_ls(args):
    target = args[0].lstrip('/') if args else ""
    path = os.path.join(STORAGE_ROOT, target)
    try:
        items = os.listdir(path)
        return items
    except Exception as e:
        return f"Error: {str(e)}"

def cmd_rm(args):
    if not args:
        return "Error: Missing target"
    target = args[0].lstrip('/')
    
    # Check if it is a registered chunk
    if target in storage.metadata["chunks"]:
        storage.delete_chunk(target)
        return f"Chunk {target} deleted"

    # Standard FS delete
    path = os.path.join(STORAGE_ROOT, target)
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
        elif os.path.isfile(path):
            os.remove(path)
        return f"Deleted {target}"
    except Exception as e:
        return f"Error: {str(e)}"

def cmd_store_chunk(args):
    # args: [chunk_id, base64_data]
    if len(args) < 2:
        return "Error: Usage store_chunk <id> <base64_data>"
    
    chunk_id = args[0]
    try:
        data = decode_data(args[1])
        result = storage.store_chunk(chunk_id, data)
        return result
    except Exception as e:
        return f"Error storing chunk: {str(e)}"

def cmd_read_chunk(args):
    if not args:
        return "Error: Missing chunk_id"
    chunk_id = args[0]
    try:
        data = storage.get_chunk(chunk_id)
        return encode_data(data)
    except Exception as e:
        return f"Error reading chunk: {str(e)}"

def cmd_stats(args):
    return storage.get_stats()

COMMAND_MAP = {
    "mkdir": cmd_mkdir,
    "ls": cmd_ls,
    "rm": cmd_rm,
    "store_chunk": cmd_store_chunk,
    "read_chunk": cmd_read_chunk,
    "stats": cmd_stats
}