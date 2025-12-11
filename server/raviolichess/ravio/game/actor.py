import asyncio
import chess
import logging
from typing import Any, Union
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
                    response = self.handle_message(msg)
                    if response:
                        await send(response)
        except StopActor:
            pass
        finally:
            # cleanup
            await stop()

    @abstractmethod
    async def handle_message(msg) -> Any:
        """
        Return:
            A python object message to send back.

        Raise:
            StopActor.
        """
        ...


class GameActor(Actor):

    def __init__(self, *, white_player, black_player):
        self.white_player = white_player
        self.black_player = black_player
        self._board = chess.Board()

    def handle_message(self, msg: ravioIN.GameProtocol) -> Union[ravioOUT.Protocol]:
        response = None

        match msg:
            case ravioIN.GameMove(san):
                try:
                    self._board.push_san(san)
                    response = ravioOUT.GameMove(
                        data=ravioOUT.GameMove.Payload(ok=True, san=san)
                    )
                except ValueError as exc:
                    response = ravioOUT.GameMove(
                        data=ravioOUT.GameMove.Payload(ok=False, san=san)
                    )
                    raise StopActor from exc
            case _:
                logger.warning("Unknown message received: %s", msg)
                raise StopActor

        return response
