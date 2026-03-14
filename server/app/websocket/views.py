import logging

from fastapi import APIRouter

from .deps import PlayDep, SiteDep

logger = logging.getLogger(__name__)

router = APIRouter()

# write the game db layer in engine and app


@router.websocket("/socket")
async def index(consumer: SiteDep):
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(consumer: PlayDep):
    await consumer()
