import logging
from abc import ABC, abstractmethod
from redis.asyncio import Redis
from channels.generic.websocket import AsyncWebsocketConsumer
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import clientIN, clientOUT, ravioIN, ravioOUT
from raviolichess.ipc.serializers import json, msgpack

logger = logging.getLogger(__name__)


# todo write a better receive / handle message
# i may need a router function first that route to the right function to handle message
class GenericConsumer(AsyncWebsocketConsumer, ABC):

    async def connect(self):
        await self.accept()
        self.layer: Redis = self.scope["state"]["layer"]

    async def send(self, response: clientIN.Protocol, close=False):
        await super().send(text_data=json.encode(response), close=close)

    async def receive(self, text_data=None):
        await self.handle_message(json.decode(text_data, type=clientOUT.Protocol))

    @abstractmethod
    async def handle_message(msg: clientOUT.Protocol):
        """handle message receive from client"""
        ...

    async def publish(self, channel, msg: ravioIN.GameProtocol):
        """route message to ravio server"""
        await self.layer.publish(channel, msgpack.encode(msg))


class SiteConsumer(GenericConsumer):
    async def handle_message(self, req: clientOUT.Protocol):
        response, channel = (None, None)
        try:
            match req:
                case clientOUT.GameCreate(data):
                    response, channel = (
                        ravioIN.GameCreate(
                            channel=self.channel_name,
                            white_player=data.white_player,
                            black_player=data.black_player,
                        ),
                        GameCreateChan(1),
                    )
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            pass
        else:
            if response and channel:
                await self.publish(channel, response)

    async def game_create(self, event: ravioOUT.GameCreate):
        await self.send(event.data)


class PlayConsumer(GenericConsumer):

    async def connect(self):
        await super().connect()
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_chan = GameChan(self.game_id)
        await self.channel_layer.group_add(
            GameGroupChan(self.game_id), self.channel_name
        )

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            GameGroupChan(self.game_id), self.channel_name
        )

    async def handle_message(self, req: clientOUT.Protocol):
        response = None
        try:
            match req:
                case clientOUT.GameMove(data):
                    response = ravioIN.GameMove(san=data.san)
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            logger.exception("error in play consumer message handling")
        else:
            if response:
                await self.publish(self.game_chan, response)

    async def game_move(self, event: ravioOUT.GameMove):
        await self.send(event.data)
