from typing import Annotated

from fastapi import Depends, Request
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.config import DbSettings
from core.db.utils import create_engine_and_sessionmaker
from core.pubsub import Broadcast

# Database

# side-effect import
engine, LocalSession = create_engine_and_sessionmaker(settings=DbSettings())


async def get_session():
    async with LocalSession() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session, scope="function")]

# note : session identity map doesn't update already populated object if you double select.
# to force update => u2 = session.scalars(select(User).where(User.id == 5).execution_options(populate_existing=True)).one()


# Redis
async def get_redis(request: Request) -> Redis:
    return request.state.redis


async def get_broadcast(request: Request) -> Broadcast:
    return request.state.broadcast


type RedisClient = Annotated[Redis, Depends(get_redis)]

type BroadCastClient = Annotated[Broadcast, Depends(get_broadcast)]
