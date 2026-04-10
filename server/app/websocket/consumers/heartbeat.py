from fastapi.websockets import WebSocket


class HeartBeat:
    def __init__(self, ws: WebSocket):
        self.ws = ws

    async def beat(self):
        pass
