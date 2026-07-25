from collections.abc import Mapping

from asyncpg import Record
from pydantic import BaseModel, ConfigDict

Mapping.register(Record)  # type: ignore


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        str_strip_whitespace=True,
        use_enum_values=False,
    )


class Message(BaseModel):
    message: str


class Redirect(BaseModel):
    redirect: str
