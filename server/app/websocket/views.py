import asyncio
import logging

from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect

from .utils import ws_receive_json, ws_send_json

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/socket")
async def index(websocket: WebSocket, sri: str):
    await websocket.accept()
    logger.info(sri)
    await websocket.send_json({"message": "pong"})

    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(handle_pubsub())
            await handle_client(websocket)
    except* WebSocketDisconnect:
        logger.info("disconnected")


async def handle_client(websocket: WebSocket):
    while True:
        data = await ws_receive_json(websocket)
        logger.info(data)
        await ws_send_json(websocket, {"message": "pong"})


async def handle_pubsub():
    await asyncio.sleep(100)
