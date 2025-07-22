import json
import asyncio
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer


class TaxiConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connect")
        self.sri = parse_qs(self.scope["query_string"].decode("utf8"))["sri"][0]
        self.task = asyncio.create_task(self.test())
        await self.channel_layer.group_add("hello", self.channel_name)
        await self.accept()
        # await self.send(text_data=json.dumps({"message": 'start'}))

    async def disconnect(self, close_code):
        self.task.cancel()
        print("disconnect")
        await self.channel_layer.group_discard("hello", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

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
