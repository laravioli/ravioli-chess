from typing import Annotated

from fastapi import BackgroundTasks, Depends

from app.deps import BroadCastClient

from .background import BackgroundNotif


async def get_notifier(broadcast: BroadCastClient, background_tasks: BackgroundTasks):
    return BackgroundNotif(broadcast, background_tasks)


type BackgroundNotifDep = Annotated[BackgroundNotif, Depends(get_notifier)]
