import logging
from abc import ABC, abstractmethod
from redis.asyncio import Redis
from channels.generic.websocket import AsyncWebsocketConsumer
from raviolichess.ipc.channels import GameCreateChan, GameChan, GameGroupChan
from raviolichess.ipc.protocol import clientIN, clientOUT, ravioIN, ravioOUT
from raviolichess.ipc.serializers import json, msgpack

logger = logging.getLogger(__name__)

create_chan = GameCreateChan(1)


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

    async def publish(self, channel, msg: ravioIN.Protocol):
        await self.layer.publish(channel, msgpack.encode(msg))


class SiteConsumer(GenericConsumer):
    async def handle_message(self, req: clientOUT.Protocol):
        pass


class GameConsumer(GenericConsumer):

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
                        create_chan,
                    )
                case clientOUT.GameMove(data):
                    response, channel = (
                        ravioIN.GameMove(san=data.san),
                        self.game_channel,
                    )
                case _:
                    logger.warning("received an unknow request")
        except Exception:
            pass
        else:
            if response and channel:
                await self.publish(channel, response)

    async def game_create(self, event: ravioOUT.GameCreate):

        game_id = event.data.game_id
        self.game_channel = GameChan(game_id)
        await self.channel_layer.group_add(GameGroupChan(game_id), self.channel_name)
        await self.send(event.data)

    async def game_move(self, event: ravioOUT.GameMove):
        await self.send(event.data)
