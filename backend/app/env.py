import asyncio
from dataclasses import dataclass

from app.challenge.service import ChallengeService
from app.notif.service import NotifService
from app.social.service import SocialService
from app.user.service import UserService
from app.web.service import WebService
from app.websocket.env import WsEnv
from ravioli_core.env import CoreEnv, CoreEnvSettings


@dataclass(slots=True, frozen=True)
class Env:
    core: CoreEnv
    ws: WsEnv
    user: UserService
    web: WebService
    notif: NotifService
    social: SocialService
    challenge: ChallengeService

    @staticmethod
    def make(*, settings: CoreEnvSettings):
        core = CoreEnv.make(settings=settings)
        notif = NotifService.make(redis=core.redis)
        ws = WsEnv.make(redis=core.redis, scheduler=core.scheduler, notif=notif)
        user = UserService.make(users=ws.users, notif=notif)
        web = WebService.make(redis=core.redis, notif=notif)
        social = SocialService.make(notif=notif)
        challenge = ChallengeService.make(redis=core.redis)

        return Env(core, ws, user, web, notif, social, challenge)

    async def on_start(self):
        await self.core.redis.ping()  # type: ignore
        await self.ws.broadcast.start()
        self.core.scheduler.start()

    async def on_stop(self):
        await self.core.scheduler.shutdown()
        await self.ws.broadcast.stop()
        await asyncio.gather(
            self.core.redis.aclose(), self.core.engine.dispose(), return_exceptions=True
        )
