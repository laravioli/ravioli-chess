import logging
from abc import ABC, abstractmethod

import chess

from core.protocol.schemas import engine_in, engine_out
from core.protocol.schemas.data import GameInfo, ValidatedMove
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
    def __init__(self, *, info: GameInfo):
        self.white_player = info.white_player
        self.black_player = info.black_player
        self._board = chess.Board()

    def handle_message(self, msg):
        response = None

        match msg:
            case engine_in.GameMove(data):
                try:
                    self._board.push_san(data.san)
                    response = engine_out.GameMove(data=ValidatedMove(ok=True, san=data.san))
                except ValueError as exc:
                    response = engine_out.GameMove(data=ValidatedMove(ok=False, san=data.san))
                    raise StopActor from exc
            case _:
                logger.warning("Unknown message received: %s", msg)
                raise StopActor

        return response
