from dataclasses import dataclass, field

from ravioli_core.ipc import c_out, p_in
from ravioli_core.ipc.channels import EngineGameChan
from ravioli_core.serializers import json

from .base import BaseClientOut, Consumer, Context


@dataclass
class Game:
    id: str
    chan: EngineGameChan = field(init=False)

    def __post_init__(self):
        self.chan = EngineGameChan(self.id)


@dataclass(frozen=True)
class PlayContext(Context):
    game: Game


class PlayConsumer(Consumer[PlayContext]):
    async def handle(self, msg):
        match msg:
            case c_out.GameMove(data):
                move = p_in.GameMove(san=data.san)
                await self.broadcast.publish(self.ctx.game.chan, move)
            case _:
                await self.global_handle(msg)

    async def receive(self):
        msg = await self.websocket.receive_text()
        return json.decode(msg, type_arg=PlayClientOut)

    async def disconnect(self):
        pass


type PlayClientOut = BaseClientOut | c_out.GameMove
