import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from .consumers import PlayConsumer, SiteConsumer

logger = logging.getLogger(__name__)

router = APIRouter()

# write the game db layer in engine and app


@router.websocket("/socket")
async def index(consumer: Annotated[SiteConsumer, Depends()]):
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(consumer: Annotated[PlayConsumer, Depends()]):
    await consumer()
