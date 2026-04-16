from typing import Annotated

from fastapi import Depends

from app.deps import DbSession
from app.notif.deps import NotifDeps

from .service import SocialService


async def create_social_service(session: DbSession, notifier: NotifDeps):
    return SocialService(session, notifier)


type SocialDeps = Annotated[SocialService, Depends(create_social_service)]
