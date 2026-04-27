from fastapi.websockets import WebSocket


class HeartBeat:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def pong(self):
        await self.websocket.send_text("0")
