from fastapi import APIRouter

from .play.deps import PlayConsumerDep
from .site.deps import SiteConsumerDep

router = APIRouter()


@router.websocket("/socket/site")
async def index(consumer: SiteConsumerDep):
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(consumer: PlayConsumerDep):
    await consumer()
