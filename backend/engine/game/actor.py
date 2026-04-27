import logging
from abc import ABC, abstractmethod

import chess
from ravioli_core.ipc import p_in, p_out

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
    def handle_message(msg):
        """
        **Return**:
            A python object message to send back.

        **Raise**:
            StopActor.
        """
        ...


class GameActor(Actor):
    def __init__(self, *, info: p_in.GameInfo):
        self.white_player = info.white_player
        self.black_player = info.black_player
        self._board = chess.Board()

    def handle_message(self, msg):
        response = None

        match msg:
            case p_in.GameMove(san):
                try:
                    self._board.push_san(san)
                    response = p_out.GameUpdate(type="move", data=p_out.GameMove(san))
                except ValueError as exc:
                    response = p_out.GameUpdate(
                        type="endData", data=p_out.GameEnd(reason="invalid move")
                    )
                    raise StopActor from exc
            case _:
                logger.warning("Unknown message received: %s", msg)
                raise StopActor

        return response
