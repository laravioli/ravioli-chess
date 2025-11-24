import msgspec
import logging
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from ipc.layer import get_layer
from ipc.channels import ChanGameCreate
from ipc.protocol.client import GameCreateRequest, GameMoveRequest
from ipc.protocol.game import GameCreateIn

logger = logging.getLogger(__name__)

GameRequest = GameCreateRequest | GameMoveRequest
GameCreateChan = ChanGameCreate(1).chan


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
        match req:
            case GameCreateRequest(data):
                msg = GameCreateIn(
                    channel=self.channel_name,
                    white_player=data.white_player,
                    black_player=data.black_player,
                )
                await self.publish(GameCreateChan, msg)
                self.t1 = time.perf_counter()
            case _:
                logger.warning("received an unknow request")

    @staticmethod
    async def publish(chan, msg):
        layer = get_layer("redis")
        await layer.publish(chan, msgspec.json.encode(msg))

    # channel layer handlers
    async def game_created(self, event):

        self.t2 = time.perf_counter()
        print(
            f"received from gamer server in {(self.t2 - self.t1)*1000}ms :",
            event["data"],
        )
        await self.send(text_data=event["data"].decode())


# websocket communication : since channel group is not 100% delivery
# use a ACK system : player A group send a move -> Player B receive ? YES: send
# to channel A a ACK -> send to A client.
# so if everything right A receive ACK(mean B receive message) and MOVE, B receive MOVE
# other wise A receive only MOVE AND B Nothing -> prb
# => resend (from client) and repeat until success(adjust time)

# websocket game memory : dont need to use in-memory hot cache for performance,
# try
# a simple collections of redis key to handle the game state
# game:id:metadata (cold), hash to store metadata
# game:id:moves (hot), find the right type to store a list of move_number/move/clock

# synchronisation in game (reload)
# when html load -> ask redis cache for inital board state
# when ws connect -> refetch data in case a move happened
# important order on connect:
# 1)group add
# 2)fetch game state
# its safe because its sequential (chess + no other method coro than on_connect
# can execute before the current coro finish so
# groupd add -> fetch -> eventually group receive), i see maybe a small race condition
# where u send 2 ACK for one move (group add , fetch )
# order on move,  save to redis -> group send
