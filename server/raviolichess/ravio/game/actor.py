import asyncio
import chess
import logging
from django.contrib.auth import get_user_model
from raviolichess.ipc.protocol import ravioIN, ravioOUT
from raviolichess.ravio.exceptions import GameStop

user_model = get_user_model()

logger = logging.getLogger(__name__)


class GameActor:

    def __init__(self, *, game_id, white_player, black_player):
        self.game_id = game_id
        self.white_player = white_player
        self.black_player = black_player
        self._board = chess.Board()

    async def __call__(self, ready, send, receive, stop):
        try:
            await ready(self.game_id)
            while True:
                msg = await receive()
                response, should_stop = self.handle_message(msg)
                if response:
                    await send(response)
                if should_stop:
                    raise GameStop()
        except asyncio.CancelledError:
            logger.debug("Game actor cancelled %s", self.game_id)
            raise
        except GameStop:
            logger.debug("Stop game actor %s", self.game_id)
        finally:
            # cleanup
            await stop()

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
