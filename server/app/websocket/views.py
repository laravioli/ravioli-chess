import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from .consumers import GameConsumer, SiteConsumer

logger = logging.getLogger(__name__)

router = APIRouter()

# write the websocket side (without db), i think keeping a function rooting like django channels is cool
# test with ravio-ws
# write the db layer
# rewrite the ipc schemas (mainly name that are horrible)
# check if ive done everything like before
# push to main -> congrats


@router.websocket("/socket")
async def index(consumer: Annotated[SiteConsumer, Depends()]):
    await consumer()


@router.websocket("/socket/play/{game_id}")
async def play(consumer: Annotated[GameConsumer, Depends()]):
    await consumer()
