import asyncio
from contextlib import asynccontextmanager, suppress
from dataclasses import dataclass

from app.auth.service import AuthService
from app.challenge.service import ChallengeService
from app.notif.service import NotifService
from app.pref.repo import PrefRepo
from app.pref.service import PrefService
from app.social.repo import SocialRepo
from app.social.service import SocialService
from app.user.repo import UserRepo
from app.user.service import UserService
from app.web.service import WebService
from app.websocket.env import WsEnv
from ravioli_core.env import CoreEnv, CoreEnvSettings


@dataclass(slots=True, frozen=True)
class Env:
    core: CoreEnv
    ws: WsEnv
    user: UserService
    auth: AuthService
    pref: PrefService
    web: WebService
    notif: NotifService
    social: SocialService
    challenge: ChallengeService

    @staticmethod
    def make(*, settings: CoreEnvSettings):
        core = CoreEnv.make(settings=settings)
        notif = NotifService.make(redis=core.redis)
        ws = WsEnv.make(redis=core.redis, scheduler=core.scheduler, notif=notif)

        pref_repo = PrefRepo()
        social_repo = SocialRepo()
        user_repo = UserRepo()

        user = UserService.make(repo=user_repo, users=ws.users, notif=notif)
        pref = PrefService(repo=pref_repo)
        auth = AuthService(redis=core.redis, repo=user_repo)
        social = SocialService.make(repo=social_repo, notif=notif)
        web = WebService.make(redis=core.redis, notif=notif)
        challenge = ChallengeService.make(redis=core.redis)

        return Env(core, ws, user, auth, pref, web, notif, social, challenge)

    @classmethod
    @asynccontextmanager
    async def lifespan(cls, *, settings: CoreEnvSettings, node_id):
        env = cls.make(settings=settings)
        redis = env.core.redis
        scheduler = env.core.scheduler

        @scheduler.periodic(10, duration=1)
        async def heartbeat():
            await redis.hsetex("app:node", node_id, "alive", ex=30)  # type: ignore

        try:
            await env._on_start()

            #########
            yield env
            #########

        finally:
            with suppress(Exception):
                await env.core.redis.hdel("app:node", node_id)  # type: ignore
            await env._on_stop()

    async def _on_start(self):
        await self.core.redis.ping()  # type: ignore
        await self.ws.broadcast.start()
        self.core.scheduler.start()

    async def _on_stop(self):
        await self.core.scheduler.shutdown()
        await self.ws.broadcast.stop()
        await asyncio.gather(
            self.core.redis.aclose(), self.core.engine.dispose(), return_exceptions=True
        )
