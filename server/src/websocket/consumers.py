import json
import asyncio
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer

from ipc.layer import get_layer
from ipc.channels import ChanGameCreate
from ipc.protocol import GameCreateIn, GameCreatePayload
import msgspec
import time

channel_test = ChanGameCreate(1).chan
client = get_layer("redis")


class GameConsumer(AsyncWebsocketConsumer):
    pass


class TaxiConsumer(GameConsumer):
    async def connect(self):
        print("connect", self.scope["user"])
        self.sri = parse_qs(self.scope["query_string"].decode("utf8"))["sri"][0]
        await self.accept()
        await self.send(text_data=json.dumps({"message": "hello"}))

    async def disconnect(self, close_code):
        print("disconnect")

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        m_type = text_data_json.get("t", None)
        if m_type == "newgame":
            await self.create_game()
        else:
            pass
            # await self.send(text_data=json.dumps({"message": "pong"}))

    async def game_create(self, event):
        self.t2 = time.perf_counter()
        print(
            f"received from gamer server in {(self.t2 - self.t1)*1000}ms :",
            event["data"],
        )
        await self.send(text_data=event["data"].decode())

    async def create_game(self):
        message = GameCreateIn(
            channel=self.channel_name,
            payload=GameCreatePayload(),
        )
        await client.publish(channel_test, msgspec.json.encode(message))
        self.t1 = time.perf_counter()


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
