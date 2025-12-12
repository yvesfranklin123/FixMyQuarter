from .commands import COMMAND_MAP
from .protocol import Message, CommandPayload, ResponsePayload

class Shell:
    def execute(self, message: Message) -> Message:
        if message.type != "CMD":
            return Message(type="ERR", payload="Invalid message type", id=message.id)

        try:
            # Payload is a dict when coming from JSON
            if isinstance(message.payload, dict):
                payload = CommandPayload(**message.payload)
            else:
                # Should not happen if protocol is respected
                return Message(type="ERR", payload="Invalid payload format", id=message.id)
            
            cmd_func = COMMAND_MAP.get(payload.command)
            
            if not cmd_func:
                resp_payload = ResponsePayload(status="ERROR", message=f"Unknown command: {payload.command}")
            else:
                result = cmd_func(payload.args)
                resp_payload = ResponsePayload(status="OK", data=result)

            return Message(type="RESP", payload=resp_payload, id=message.id)

        except Exception as e:
            return Message(
                type="ERR", 
                payload=str(e), 
                id=message.id
            )