from fastapi import WebSocket

from core.serializers import json


async def ws_send_json(websocket: WebSocket, data) -> None:
    await websocket.send({"type": "websocket.send", "text": json.encode_as_str(data)})


async def ws_receive_json[T](websocket: WebSocket, type: type[T] = object) -> T:
    txt = await websocket.receive_text()
    return json.decode(txt, type=type)
