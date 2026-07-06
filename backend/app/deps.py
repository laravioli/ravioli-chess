from typing import TYPE_CHECKING, Annotated

from fastapi import BackgroundTasks, Depends
from fastapi.requests import HTTPConnection
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, AsyncSession

from ravioli_core.env import CoreEnv
from ravioli_core.pubsub import Publisher

from .background import Background

if TYPE_CHECKING:
    from app.api.env import ApiEnv
    from app.challenge.service import ChallengeService
    from app.notif.service import NotifService
    from app.social.service import SocialService
    from app.web.service import WebService
    from app.websocket.env import WsEnv
    from app.websocket.pubsub import Users


# ╔══════════════════════════════════════╗
# ║   ENV                                ║
# ╚══════════════════════════════════════╝


async def get_core_env(conn: HTTPConnection) -> CoreEnv:
    return conn.state["core_env"]


type CoreDep = Annotated[CoreEnv, Depends(get_core_env)]


async def get_api_env(conn: HTTPConnection) -> "ApiEnv":
    return conn.state["api_env"]


type ApiDep = Annotated["ApiEnv", Depends(get_api_env)]


async def get_ws_env(conn: HTTPConnection) -> "WsEnv":
    return conn.state["ws_env"]


type WsDep = Annotated["WsEnv", Depends(get_ws_env)]


# ╔══════════════════════════════════════╗
# ║   API SERVICE                        ║
# ╚══════════════════════════════════════╝


async def get_web(env: ApiDep):
    return env.web


async def get_notif(env: ApiDep):
    return env.notif


async def get_social(env: ApiDep):
    return env.social


async def get_challenge(env: ApiDep):
    return env.challenge


type WebServiceDep = Annotated["WebService", Depends(get_web)]
type NotifServiceDep = Annotated["NotifService", Depends(get_notif)]
type SocialServiceDep = Annotated["SocialService", Depends(get_social)]
type ChallengeServiceDep = Annotated["ChallengeService", Depends(get_challenge)]


# ╔══════════════════════════════════════╗
# ║   USERS                              ║
# ╚══════════════════════════════════════╝


async def get_users(env: WsDep):
    return env.users


type UsersDep = Annotated["Users", Depends(get_users)]

# ╔══════════════════════════════════════╗
# ║   DATABASE                           ║
# ╚══════════════════════════════════════╝


async def get_engine(env: CoreDep):
    return env.engine


type EngineDep = Annotated[AsyncEngine, Depends(get_engine)]


async def get_connection(env: CoreDep):
    async with env.engine.connect() as conn:
        yield conn


type DbConnection = Annotated[AsyncConnection, Depends(get_connection)]


async def get_session(env: CoreDep):
    async with env.session_maker() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]


# NOTE : session identity map doesn't update already populated object if you double select.
# NOTE to force update => u2 = session.scalars(select(User).where(User.id == 5).execution_options(populate_existing=True)).one()


# ╔══════════════════════════════════════╗
# ║   REDIS                              ║
# ╚══════════════════════════════════════╝


async def get_redis(env: CoreDep):
    return env.redis


type RedisClient = Annotated[Redis, Depends(get_redis)]


# ╔══════════════════════════════════════╗
# ║   PUBLISHER                          ║
# ╚══════════════════════════════════════╝


async def get_publisher(env: CoreDep):
    return env.pub


type PublisherDep = Annotated[Publisher, Depends(get_publisher)]


# ╔══════════════════════════════════════╗
# ║   BACKGROUND                         ║
# ╚══════════════════════════════════════╝


async def get_background(env: CoreDep, background_tasks: BackgroundTasks):
    return Background(env.pub, env.session_maker, background_tasks)


type BackgroundDep = Annotated[Background, Depends(get_background)]
