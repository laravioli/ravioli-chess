import logging
from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator, Awaitable, Callable

import chess

from engine.exceptions import StopActor
from ravioli_core.ipc import e_in, w_in

logger = logging.getLogger(__name__)


class Actor[S, R](ABC):
    async def __call__(
        self,
        send: Callable[[S], Awaitable[None]],
        receive: AsyncGenerator[R],
    ):
        try:
            async for msg in receive:
                response = self.handle_message(msg)
                if response:
                    await send(response)
        except StopActor:
            pass
        finally:
            logger.info("stop game actor")

    @abstractmethod
    def handle_message(self, msg: R) -> S | None:
        """
        **Return**:
            A python object message to send back.

        **Raise**:
            StopActor.
        """
        ...


class GameActor(Actor[w_in.GameUpdate, e_in.GameUpdate]):
    def __init__(self):
        self._board = chess.Board()

    def handle_message(self, msg):
        response = None

        match msg:
            case e_in.GameMove(_, san):
                try:
                    self._board.push_san(san)
                    response = w_in.GameUpdate(type="move", data=w_in.D_GameMove(san))
                except ValueError as exc:
                    response = w_in.GameUpdate(
                        type="endData", data=w_in.D_GameEnd(reason="invalid move")
                    )
                    raise StopActor from exc
            case _:
                logger.warning("Unknown message received: %s", msg)

        return response
