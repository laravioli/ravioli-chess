from sqlalchemy import CursorResult, select, update
from sqlalchemy import delete as _delete
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Item
from .schemas import ItemCreate, ItemUpdate


async def get_one(session: AsyncSession, item_id: int):
    item = await session.get(Item, item_id)

    return item


async def get_all(session: AsyncSession) -> list[Item]:
    results = await session.execute(select(Item))
    return results.scalars().all()


async def post(session: AsyncSession, item_data: ItemCreate):
    item = Item(**item_data.model_dump())
    session.add(item)
    await session.commit()
    return item


async def put(session: AsyncSession, item_id: int, item_data: ItemUpdate):
    stmt = (
        update(Item)
        .where(Item.id == item_id)
        .values(**item_data.model_dump(exclude_unset=True))
        .returning(Item)
    )
    result = await session.execute(stmt)
    item = result.scalar_one_or_none()
    await session.commit()

    return item


async def delete(session: AsyncSession, item_id: int):
    stmt = _delete(Item).where(Item.id == item_id)
    result: CursorResult = await session.execute(stmt)
    await session.commit()
    return result.rowcount > 0
