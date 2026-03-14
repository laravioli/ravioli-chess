import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from .consumers import PlayConsumer, SiteConsumer

logger = logging.getLogger(__name__)

router = APIRouter()

# test with ravio-ws
# check if ive done everything like before
# push to main -> congrats
# rewrite the ipc schemas (mainly name that are horrible)
# write the db layer


@router.websocket("/socket")
async def index(consumer: Annotated[SiteConsumer, Depends()]):
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(consumer: Annotated[PlayConsumer, Depends()]):
    await consumer()
