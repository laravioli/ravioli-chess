from dataclasses import dataclass

from app.websocket.frame import c_out
from ravioli_core.ipc import e_in
from ravioli_core.ipc.channels import EngChan
from ravioli_core.serializers import json

from .base import BaseClientOut, Consumer, Context


@dataclass
class Game:
    id: str


@dataclass(frozen=True)
class PlayContext(Context):
    game: Game


class PlayConsumer(Consumer[PlayContext]):
    async def handle(self, msg):
        match msg:
            case c_out.GameMove(data):
                move = e_in.GameMove(game_id=self.ctx.game.id, san=data.san)
                await self.pub.publish(EngChan.game, move)
            case _:
                await self.global_handle(msg)

    async def receive(self):
        msg = await self.websocket.receive_text()
        return json.decode(msg, type_arg=PlayClientOut)

    async def disconnect(self):
        pass


type PlayClientOut = BaseClientOut | c_out.GameMove
