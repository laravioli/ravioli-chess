import logging
from abc import ABC, abstractmethod

import chess

from core.ipc.schemas import EngineIn, EngineOut
from engine.exceptions import StopActor

logger = logging.getLogger(__name__)


class Actor(ABC):
    async def __call__(self, receive, send):
        try:
            async for msg in receive():
                response = self.handle_message(msg)
                if response:
                    await send(response)
        except StopActor:
            pass
        finally:
            logger.info("stop game actor")

    @abstractmethod
    async def handle_message(msg):
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

    def handle_message(self, msg):
        response = None

        match msg:
            case EngineIn.GameMove(san):
                try:
                    self._board.push_san(san)
                    response = EngineOut.GameMove(data=EngineOut.GameMove.Payload(ok=True, san=san))
                except ValueError as exc:
                    response = EngineOut.GameMove(
                        data=EngineOut.GameMove.Payload(ok=False, san=san)
                    )
                    raise StopActor from exc
            case _:
                logger.warning("Unknown message received: %s", msg)
                raise StopActor

        return response
