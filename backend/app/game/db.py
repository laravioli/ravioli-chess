import secrets
import string

from app.types import GameId
from ravioli_core.db.queries import GameQueries
from ravioli_core.db.types import PGConnection

from .schemas import GameWithId, NewGame


def id8():
    return GameId("".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8)))


def game_with_id(new_game: NewGame):
    return GameWithId(
        id=new_game.id or id8(),
        white_player=new_game.white_player,
        black_player=new_game.black_player,
    )


async def db_create_game(conn: PGConnection, game: GameWithId):
    await conn.execute(GameQueries.create, game.id, game.white_player, game.black_player)
    return game
