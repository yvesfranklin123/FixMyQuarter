import json
import base64
from dataclasses import dataclass, asdict
from typing import Any, Optional

@dataclass
class Message:
    type: str  # "CMD", "RESP", "ERR", "HEARTBEAT"
    payload: Any
    id: Optional[str] = None

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    @staticmethod
    def from_json(json_str: str) -> 'Message':
        data = json.loads(json_str)
        return Message(**data)

@dataclass
class CommandPayload:
    command: str
    args: list

@dataclass
class ResponsePayload:
    status: str  # "OK", "ERROR"
    data: Any = None
    message: str = ""

def encode_data(data_bytes: bytes) -> str:
    return base64.b64encode(data_bytes).decode('utf-8')

def decode_data(data_str: str) -> bytes:
    return base64.b64decode(data_str)