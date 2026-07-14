# Import every model here

from .challenge import Challenge, ChallengeStatus
from .game import Game, GameStatus
from .notif import FriendRequest, FriendRequestAccepted, Notification
from .pref import SA_Preference
from .social import Friendship
from .user import SA_User
from .web import ChessPosition

__all__ = [
    "Challenge",
    "ChallengeStatus",
    "Game",
    "GameStatus",
    "Notification",
    "FriendRequest",
    "FriendRequestAccepted",
    "SA_Preference",
    "Friendship",
    "SA_User",
    "ChessPosition",
]
