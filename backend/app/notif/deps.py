from typing import Annotated

from fastapi import BackgroundTasks, Depends

from app.deps import EnvDep

from .background import BackgroundNotif


async def get_notifier(env: EnvDep, background_tasks: BackgroundTasks):
    return BackgroundNotif(env.pub, env.session_maker, background_tasks)


type BackgroundNotifDep = Annotated[BackgroundNotif, Depends(get_notifier)]
