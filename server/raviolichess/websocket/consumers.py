import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from raviolichess.ipc.layer import get_layer
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import clientIN, clientOUT, ravioIN, ravioOUT

logger = logging.getLogger(__name__)

create_chan = GameCreateChan(1)

# for testing create serializers here
from raviolichess.ipc.serializers import (
    SerializerRegistry,
    MsgpackSerializer,
    JsonSerializer,
)

serializers = SerializerRegistry()
serializers.register("json", JsonSerializer())
serializers.register("msgpack", MsgpackSerializer())


class GameConsumer(AsyncWebsocketConsumer):

    # lifetime
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        logger.debug("ws disconnected")

    # client handlers
    async def receive(self, text_data: str):
        req = serializers.json.deserialize(text_data, type=clientOUT.Protocol)
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
    async def publish(channel, msg: ravioIN.Protocol):
        layer = get_layer()
        await layer.publish(channel, serializers.msgpack.serialize(msg))

    # channel layer handlers
    async def game_create(self, event: ravioOUT.GameCreate):

        # current impl for testing
        game_id = event.data.game_id
        self.game_channel = GameChan(game_id)
        await self.channel_layer.group_add(GameGroupChan(game_id), self.channel_name)
        await self.send(serializers.json.serialize(event.data))

    async def game_move(self, event: ravioOUT.GameMove):
        await self.send(text_data=serializers.json.serialize(event.data))
