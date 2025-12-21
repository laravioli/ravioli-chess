from app.db.core import DbSession
from fastapi import APIRouter, HTTPException, status

from .schemas import ItemCreate, ItemDeleted, ItemReturn, ItemUpdate
from .service import delete, get_all, get_one, post, put

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[ItemReturn])
async def get_items(
    session: DbSession,
):
    return await get_all(session)


@router.get("/{item_id}", response_model=ItemReturn)
async def get_item(session: DbSession, item_id: int):
    item = await get_one(session, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


@router.post("/", response_model=ItemReturn, status_code=status.HTTP_201_CREATED)
async def post_item(session: DbSession, item_data: ItemCreate):
    item = await post(session, item_data)
    return item


@router.put("/{item_id}", response_model=ItemReturn)
async def put_item(session: DbSession, item_id: int, item_data: ItemUpdate):
    item = await put(session, item_id, item_data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


@router.delete("/{item_id}", response_model=ItemDeleted)
async def delete_item(session: DbSession, item_id: int):
    success = await delete(session, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id, "success": True}
