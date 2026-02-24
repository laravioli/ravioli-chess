from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# side-effect import
engine = create_async_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_size=10)

LocalSession = async_sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


async def get_session():
    async with LocalSession() as session:
        yield session


type DbSession = Annotated[AsyncSession, Depends(get_session)]

# note : session identity map doesn't update already populated object if you double select.
# to force update => u2 = session.scalars(select(User).where(User.id == 5).execution_options(populate_existing=True)).one()
