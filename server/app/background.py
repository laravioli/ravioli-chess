from collections.abc import Callable, Coroutine
from typing import Annotated, Any

from fastapi import BackgroundTasks, Depends

from app.deps import BroadCastClient
from core.ipc import p_out

type Msg = p_out.TellSocket | p_out.TellUser
type GetMsg = Coroutine[Any, Any, Msg]


async def publish(broadcast: BroadCastClient, channel: str, fn: GetMsg):
    await broadcast.publish(channel, await fn())


# note: might be a good idea to decouple publish and background
# if i implement a presence system i may not publish but want to execute fn
async def publish_backgroud(background_tasks: BackgroundTasks, broadcast: BroadCastClient):
    def task(channel, fn):
        background_tasks.add_task(publish, broadcast, channel, fn)

    return task


type PublishFn = Callable[[str, GetMsg], None]
type Publish = Annotated[PublishFn, Depends(publish_backgroud)]
