from .handler import make_handler
from .listener import Listener
from .publisher import Publisher
from .subscriber import Subscriber

__all__ = ["make_handler", "Listener", "Publisher", "Subscriber"]

# architecure design
# use pubsub for broadcast moves
# engine : store pre-serialized list of moves for resync (msgspec)
# websocket: ask this list of moves for resync otherwise use pubsub (avoid unsub unless game_end/to)
# http: only use a small payload stored in redis: lastFen + move_number,
# then websocket send the whole game state
# use a decoupled architecture with an History actor in websocket:
# the History handle the broadcasting to websockets that subscribe to a game
# a websocket ask for a number of move based on either an url query_param or a payload
# -> hit history -> eventually hit engine server and precomputed list
# this avoid redis stream, reduce memory usage and is faster/scale better
# instead of unsub when a a websocket server has 0 internal sub ->
# keep listening and buff raw move string in a list
