# Import every model here

from .game import Game
from .game import Status as GameStatus
from .notif import FriendRequest, FriendRequestAccepted, Notification
from .pref import Preference
from .social import Friendship
from .user import User
from .web import ChessPosition

__all__ = [
    "Game",
    "GameStatus",
    "Notification",
    "FriendRequest",
    "FriendRequestAccepted",
    "Preference",
    "Friendship",
    "User",
    "ChessPosition",
]
