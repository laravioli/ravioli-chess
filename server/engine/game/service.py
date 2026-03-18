import secrets
import string

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models import Game, User
from core.ipc import engine_in
from core.ipc.structs import GameInfo
from engine.deps import LocalSession


def id8():
    return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))


async def create_game_db(msg: engine_in.GameStart):
    game_id = id8() if isinstance(msg, engine_in.GameCreate) else msg.id

    async with LocalSession() as session:
        players = await get_players(session, msg.data)
        new_game = Game(
            game_id=game_id,
            white=players.get(msg.data.white_player),
            black=players.get(msg.data.black_player),
        )

        session.add(new_game)
        await session.commit()

    return game_id


async def get_players(session: AsyncSession, info: GameInfo) -> dict[str, User]:
    usernames = [p for p in (info.white_player, info.black_player) if p is not None]
    players = {}
    if usernames:
        stmt = select(User).where(User.username.in_(usernames))
        result = await session.scalars(stmt)
        for user in result:
            players[user.username] = user

    return players
