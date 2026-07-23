import datetime
from typing import Annotated, Literal

import asyncpg
from sqlalchemy import String, func, text
from sqlalchemy.orm import mapped_column

# ╔══════════════════════════════════════╗
# ║          DDL                         ║
# ╚══════════════════════════════════════╝


# Keys
type PrimaryKey[T] = Annotated[T, mapped_column(primary_key=True)]

# Time
type TimestampNow = Annotated[datetime.datetime, mapped_column(server_default=func.now())]

type TimestampUpdated = Annotated[
    datetime.datetime, mapped_column(server_default=func.now(), onupdate=func.now())
]


def expire_after(value: int, unit: Literal["minutes", "hours", "days"]):
    assert value >= 0

    return mapped_column(
        server_default=text(f"CURRENT_TIMESTAMP + INTERVAL '{value} {unit}'"), index=True
    )


type ExpireAfter1Hour = Annotated[datetime.datetime, expire_after(1, "hours")]
type ExpireAfter1Day = Annotated[datetime.datetime, expire_after(1, "days")]
type ExpireAfter1Week = Annotated[datetime.datetime, expire_after(7, "days")]

# Ids
type GameId8 = Annotated[str, mapped_column(String(8), unique=True, index=True, nullable=False)]
type ChallengeId8 = Annotated[
    str, mapped_column(String(8), unique=True, index=True, nullable=False)
]

# Chess
type Fen = Annotated[str, mapped_column(String(100), nullable=False)]
type TimeControl = Annotated[str, mapped_column(String(10), nullable=True)]

# ╔══════════════════════════════════════╗
# ║          OTHER                       ║
# ╚══════════════════════════════════════╝

type PGConnection = asyncpg.Connection | asyncpg.pool.PoolConnectionProxy
