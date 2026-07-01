from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Query, status
from pydantic import UUID4

from app.auth.deps import UserOrAnon
from ravioli_core.db.models import User


@dataclass
class Pair:
    sender: User | None
    receiver: UUID4 | None


async def matchable(
    current_user: UserOrAnon,
    target: UUID4 | None = Query(None),
):
    if (not current_user) and target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="you must be connected to challenge users",
        )
    if current_user and current_user.id == target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="challenge yourself is not allowed",
        )
    return Pair(current_user, target)


type MatchableUsers = Annotated[Pair, Depends(matchable)]
