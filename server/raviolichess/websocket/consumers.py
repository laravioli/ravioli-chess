import msgspec
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from raviolichess.ipc.layer import get_layer
from raviolichess.ipc.channels import ChanGameCreate, ChanGame, GroupChanGame
from raviolichess.ipc.protocol.client import *
from raviolichess.ipc.protocol.game import GameCreateIn, MoveIn

logger = logging.getLogger(__name__)

GameRequest = GameCreateRequest | GameMoveRequest
GameCreateChan = ChanGameCreate(1).chan


# OSError -> uvicorn client disconnected -> throw if we send but client disconnected
# BaseException -> uvicorn throw if we dont respect the protocol -> could
# happen with AsyncWebSocketConsumer + channel_redis
# because what could happen : (channel) dispatch yield -> we receive a disconnect a frame ->
# -> because dispatch is sequential -> back to (channel dispatch) -> send -> Error
# -> the rules are: only one disptatch at a time, the other family can receive a frame if
# dispatch yield
# im fine with the OSError, not the RunTimeError because of how django channel handle interaction between 2 pipes of communication
# so i will create my own base consumer


class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        logger.info("ws %s connected", self.channel_name)

    async def disconnect(self, close_code):
        logger.info("ws %s disconnected", self.channel_name)

    async def receive(self, text_data=None):
        req = msgspec.json.decode(text_data, type=GameRequest)
        await self.handle_request(req)

    async def handle_request(self, req: GameRequest):
        """handle game message, transform/proxy it to game server"""
        msg, channel = (None, None)
        try:
            match req:
                case GameCreateRequest(data):
                    msg, channel = (
                        GameCreateIn(
                            channel=self.channel_name,
                            white_player=data.white_player,
                            black_player=data.black_player,
                        ),
                        GameCreateChan,
                    )
                case GameMoveRequest(data):
                    msg, channel = (MoveIn(san=data.san), self.game_channel)
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
        game_id = msgspec.json.decode(event["data"], type=GameCreateResponse).game_id
        self.game_channel = ChanGame(game_id).chan
        logger.info("game channel %s", self.game_channel)
        await self.channel_layer.group_add(
            GroupChanGame(game_id).chan, self.channel_name
        )

        await self.send(text_data=event["data"].decode())

    async def game_move(self, event):
        self.t2 = time.perf_counter()
        print(
            f"received from gamer server in {(self.t2 - self.t1)*1000}ms :",
            event["data"],
        )
        await self.send(text_data=event["data"].decode())

    async def disconnect(self, code):
        print("then end")
