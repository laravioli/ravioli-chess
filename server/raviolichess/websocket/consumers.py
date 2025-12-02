import msgspec
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from raviolichess.ipc.layer import get_layer
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import clientIN, clientOUT, ravioIN

logger = logging.getLogger(__name__)

create_chan = GameCreateChan(1)


class GameConsumer(AsyncWebsocketConsumer):

    # lifetime
    async def connect(self):
        await self.accept()
        logger.info("ws %s connected", self.channel_name)

    async def disconnect(self, close_code):
        logger.info("ws %s disconnected with code %i", self.channel_name, close_code)

    # client handlers
    async def receive(self, text_data=None):
        req = msgspec.json.decode(text_data, type=clientOUT.Protocol)
        await self.handle_game_frame(req)

    async def handle_game_frame(self, req: clientOUT.Protocol):
        """transform/proxy message to game server"""
        msg, channel = (None, None)
        try:
            match req:
                case clientOUT.GameCreate(data):
                    msg, channel = (
                        ravioIN.GameCreate(
                            channel=self.channel_name,
                            white_player=data.white_player,
                            black_player=data.black_player,
                        ),
                        create_chan,
                    )
                case clientOUT.GameMove(data):
                    msg, channel = (ravioIN.GameMove(san=data.san), self.game_channel)
                case _:
                    logger.warning("received an unknow request")
        finally:
            if msg and channel:
                await self.publish(channel, msg)
                self.t1 = time.perf_counter()

    @staticmethod
    async def publish(channel, msg):
        layer = get_layer()
        await layer.publish(channel, msgspec.json.encode(msg))

    # channel layer handlers
    async def game_created(self, event):

        self.t2 = time.perf_counter()
        print(
            f"received from gamer server in {(self.t2 - self.t1)*1000}ms :",
            event["data"],
        )
        # current impl for testing
        game_id = msgspec.json.decode(event["data"], type=clientIN.GameCreate).game_id
        self.game_channel = GameChan(game_id)
        logger.info("game channel %s", self.game_channel)
        await self.channel_layer.group_add(GameGroupChan(game_id), self.channel_name)

        await self.send(text_data=event["data"].decode())

    async def game_move(self, event):
        self.t2 = time.perf_counter()
        print(
            f"received from gamer server in {(self.t2 - self.t1)*1000}ms :",
            event["data"],
        )
        await self.send(text_data=event["data"].decode())
