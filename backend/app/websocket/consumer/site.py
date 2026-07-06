from app.game.db import NewGame, db_create_game, game_with_id
from ravioli_core.ipc import e_in
from ravioli_core.ipc.channels import EngChan
from ravioli_core.serializers import json

from ..frame import c_out
from .base import BaseClientOut, Consumer


class SiteConsumer(Consumer):
    async def handle(self, msg):
        match msg:
            # test
            case c_out.GameCreate(data):
                game = await db_create_game(
                    self.env.core.engine,
                    game_with_id(
                        NewGame(white_player=data.white_player, black_player=data.black_player)
                    ),
                )

                await self.pub.publish(
                    EngChan.game,
                    e_in.GameStart(
                        game_id=game.id,
                        sri=self.ctx.sri,
                        clock=e_in.D_GameClock(time_control=5, increment=0),
                    ),
                )
                # end test
            case _:
                await self.global_handle(msg)

    async def receive(self):
        msg = await self.websocket.receive_text()
        return json.decode(msg, type_arg=SiteClientOut)

    async def disconnect(self):
        pass


type SiteClientOut = BaseClientOut | c_out.GameCreate
