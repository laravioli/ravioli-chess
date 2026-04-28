from dataclasses import dataclass
from typing import Annotated
from uuid import UUID

from pydantic import BeforeValidator, StringConstraints

from app.api.schemas import BaseSchema
from ravioli_core.ipc.channels import EngineGameChan

SRI_PATTERN = r"^[a-zA-Z0-9_]+$"


@dataclass
class Game:
    id: str
    chan: EngineGameChan


class User(BaseSchema):
    id: Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, UUID) else v)]
    username: str
    is_active: bool
    is_staff: bool


type MaybeUser = User | None

type Sri = Annotated[str, StringConstraints(min_length=8, max_length=12, pattern=SRI_PATTERN)]
