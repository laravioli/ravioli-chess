import json
import asyncio
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer


class TaxiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connect", self.scope["user"])
        self.sri = parse_qs(self.scope["query_string"].decode("utf8"))["sri"][0]
        await self.accept()
        await self.send(text_data=json.dumps({"message": "hello"}))

    async def disconnect(self, close_code):
        print("disconnect")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        type = text_data_json.get("t", None)
        await self.send(text_data=json.dumps({"message": "pong"}))

    async def test(self):
        session = self.scope["session"]
        user = self.scope["user"]

        try:
            while True:
                # print(user)
                await asyncio.sleep(2)
        except asyncio.CancelledError:
            pass


# r.zadd("online_users", {user_id: time.time()}) heartbeat client update his presence
# online_count = r.zcount("online_users", time.time() - 60, "+inf") fetch count from redis
# from celery import Celery
# import redis
# import time

# app = Celery("tasks", broker="redis://localhost:6379/0")

# @app.task
# def clean_expired_users():
#    r = redis.Redis()
#    cutoff = time.time() - 60
#    r.zremrangebyscore("online_users", 0, cutoff)
# fuck it go for celery

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
