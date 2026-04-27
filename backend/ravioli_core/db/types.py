import datetime
from typing import Annotated

from sqlalchemy import String, func
from sqlalchemy.orm import mapped_column

type PrimaryKey[T] = Annotated[T, mapped_column(primary_key=True)]

type TimestampNow = Annotated[datetime.datetime, mapped_column(server_default=func.now())]

type TimestampUpdated = Annotated[
    datetime.datetime, mapped_column(server_default=func.now(), onupdate=func.now())
]

type GameId8 = Annotated[str, mapped_column(String(8), unique=True, index=True)]
