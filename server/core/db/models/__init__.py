# Import every model here

from .game import Game
from .notif import FriendRequest, Notification
from .pref import Preference
from .social import Friendship
from .user import User
from .web import ChessPosition

__all__ = [
    "Game",
    "FriendRequest",
    "Notification",
    "Preference",
    "Friendship",
    "User",
    "ChessPosition",
]
