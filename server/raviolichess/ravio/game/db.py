from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError
from channels.db import database_sync_to_async
from redis.exceptions import RedisError
from raviolichess.game.models import Game
from raviolichess.game.id import id8
from raviolichess.ipc.protocol import ravioIN
from raviolichess.ravio.idprovider import AsyncIdProvider
from raviolichess.ravio.utils import async_retry

user_model = get_user_model()


class GameDB:

    def __init__(self, id_provider):
        self._id_provider: AsyncIdProvider = id_provider

    async def new_game(self, msg: ravioIN.GameStart):
        match msg:
            case ravioIN.GameCreate():
                return await self.game_with_id(msg)
            case ravioIN.ChallengeAccepted():
                return await self.game(msg)
            case _:
                pass

    @async_retry(max_retries=3, retry_exceptions=(IntegrityError,))
    async def game_with_id(self, msg: ravioIN.GameCreate):
        try:
            game_id = await self._id_provider.one()
        except RedisError:
            game_id = id8()
        await self.create_game_db(
            game_id=game_id,
            white_player=msg.white_player,
            black_player=msg.black_player,
        )

        return game_id

    async def game(self, msg: ravioIN.ChallengeAccepted):
        await self.create_game_db(
            game_id=msg.id,
            white_player=msg.white_player,
            black_player=msg.black_player,
        )
        return msg.id

    @staticmethod
    @database_sync_to_async
    def create_game_db(game_id, white_player=None, black_player=None):
        users = {}
        usernames = filter(lambda x: isinstance(x, str), (white_player, black_player))

        # silently assign unknow players to None
        if white_player or black_player:
            users.update(
                {
                    user.username: user
                    for user in user_model.objects.filter(username__in=usernames)
                }
            )
        Game.objects.create(
            game_id=game_id,
            white_player=users.get(white_player),
            black_player=users.get(black_player),
            status=Game.Status.CREATED,
        )
