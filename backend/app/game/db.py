import secrets
import string

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncEngine

from app.types import GameId
from ravioli_core.db.models import Game

from .schemas import GameWithId, NewGame


def id8():
    return GameId("".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8)))


def game_with_id(new_game: NewGame):
    return GameWithId(
        id=new_game.id or id8(),
        white_player=new_game.white_player,
        black_player=new_game.black_player,
    )


async def db_create_game(engine: AsyncEngine, game: GameWithId):
    async with engine.begin() as conn:
        await conn.execute(insert(Game).values({"game_id": game.id}))
        await conn.commit()
    return game
