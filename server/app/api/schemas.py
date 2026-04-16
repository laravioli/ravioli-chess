from typing import TypeVar

from fastapi import Query
from fastapi_pagination import Page, Params
from fastapi_pagination.customization import CustomizedPage, UseName, UseParams
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, validate_assignment=True, str_strip_whitespace=True
    )


class Message(BaseModel):
    message: str


## Pagination ##
T = TypeVar("T")


class SmallPageFilter(Params):
    page: int = Query(1, ge=1, description="Page number")
    size: int = Query(7, ge=1, le=20, description="Page size")

    def is_default_page(self):
        return self.page == 1 and self.size == 7


SmallPage = CustomizedPage[Page[T], UseParams(SmallPageFilter), UseName("Page")]
