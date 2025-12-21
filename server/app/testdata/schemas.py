from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()


class ItemBase(BaseModel):
    name: str
    description: str | None = None
    price: float


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: str | None = None
    description: str | None = None
    price: float | None = None


class ItemReturn(ItemBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ItemDeleted(BaseModel):
    id: int
    success: bool
