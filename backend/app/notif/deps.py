from typing import Annotated

from fastapi import BackgroundTasks, Depends

from app.deps import PublisherDep

from .background import BackgroundNotif


async def get_notifier(pub: PublisherDep, background_tasks: BackgroundTasks):
    return BackgroundNotif(pub, background_tasks)


type BackgroundNotifDep = Annotated[BackgroundNotif, Depends(get_notifier)]
