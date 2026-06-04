from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncEngine

from app.notif.service import NotifService
from ravioli_core.pubsub import Broadcast

from .users import Users


@dataclass(slots=True, frozen=True)
class WsEnv:
    broadcast: Broadcast
    engine: AsyncEngine
    notif: NotifService
    users: Users
