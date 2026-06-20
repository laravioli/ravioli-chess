import asyncio
from functools import partial

from engine.pubsub import Publisher, Subscriber
from ravioli_core.ipc import e_in, w_in
from ravioli_core.ipc.channels import WsChan

from .actor import GameActor

type GameID = str


class Games:
    def __init__(self, pub: Publisher):
        self._mapping: dict[GameID, Subscriber] = {}
        self._actors: set[asyncio.Task] = set()
        self._pub = pub

    def publish_one(self, game_id: GameID, msg: e_in.GameUpdate):
        sub = self._mapping.get(game_id)
        if sub:
            sub.put_nowait(msg)

    async def stop(self):
        for sub in self._mapping.values():
            sub.shutdown(immediate=False)
        if len(self._actors) > 0:
            _, pending = await asyncio.wait(self._actors, timeout=10)
            for task in pending:
                task.cancel()
            await asyncio.gather(*pending, return_exceptions=True)

    def start_game(self, game_info: e_in.GameStart):
        game_id = game_info.game_id
        sub = Subscriber()
        self._mapping[game_id] = sub

        publish = self._pub.publish
        game_channel = WsChan.play(game_id)

        async def send(msg: w_in.GameUpdate):
            await publish(game_channel, msg)

        async def receive():
            await publish(
                WsChan.sri(game_info.sri),
                w_in.TellSri(type="gameCreate", data=w_in.D_GameId(game_id)),
            )
            async for msg in sub.iter_message():
                yield msg

        game = GameActor()
        task = asyncio.create_task(game(send, receive()))
        self._actors.add(task)
        task.add_done_callback(partial(self.stop_game, game_id))

    def stop_game(self, game_id: GameID, task: asyncio.Task):
        del self._mapping[game_id]
        self._actors.discard(task)
