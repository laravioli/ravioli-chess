# Import every model here

from .challenge import Challenge
from .game import Game, GameStatus
from .notif import FriendRequest, FriendRequestAccepted, Notification
from .pref import Preference
from .social import Friendship
from .user import User
from .web import ChessPosition

__all__ = [
    "Challenge",
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
