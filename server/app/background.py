from collections.abc import Callable
from typing import Annotated

from fastapi import BackgroundTasks, Depends

from app.deps import BroadCastClient
from core.ipc import app_out
from core.ipc.structs import ServerMsg


async def publish(broadcast: BroadCastClient, channel: str, msg: app_out.Protocol):
    await broadcast.publish(channel, ServerMsg(source="app", msg=msg))


async def publish_backgroud(background_tasks: BackgroundTasks, broadcast: BroadCastClient):
    def task(channel, msg):
        background_tasks.add_task(publish, broadcast, channel, msg)

    return task


type Publish = Callable[[str, app_out.Protocol], None]
type PublishDep = Annotated[Publish, Depends(publish_backgroud)]
