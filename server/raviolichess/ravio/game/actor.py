import asyncio
import chess
import logging
from typing import Any
from abc import ABC, abstractmethod
from django.contrib.auth import get_user_model
from raviolichess.ipc.protocol import ravioIN, ravioOUT
from raviolichess.ravio.exceptions import StopActor

user_model = get_user_model()

logger = logging.getLogger(__name__)


class Actor(ABC):
    async def __call__(self, ready, send, receive, stop):
        try:
            await ready()
            while True:
                try:
                    msg = await receive()
                except asyncio.QueueShutDown:
                    break
                else:
                    response, should_stop = self.handle_message(msg)
                    if response:
                        await send(response)
                    if should_stop:
                        raise StopActor()
        except StopActor:
            pass
        finally:
            # cleanup
            await stop()

    @abstractmethod
    async def handle_message(msg) -> tuple[Any, bool]: ...


class GameActor(Actor):

    def __init__(self, *, white_player, black_player):
        self.white_player = white_player
        self.black_player = black_player
        self._board = chess.Board()

    def handle_message(
        self, msg: ravioIN.GameProtocol
    ) -> tuple[ravioOUT.Protocol, bool]:
        response = None
        should_stop = False

        match msg:
            case ravioIN.GameMove(san):
                try:
                    self._board.push_san(san)
                    response = ravioOUT.GameMove(
                        data=ravioOUT.GameMove.Payload(ok=True, san=san)
                    )
                except ValueError:
                    response = ravioOUT.GameMove(
                        data=ravioOUT.GameMove.Payload(ok=False, san=san)
                    )
                    should_stop = True
            case _:
                logger.warning("Unknown message received: %s", msg)
                should_stop = True

        return response, should_stop
