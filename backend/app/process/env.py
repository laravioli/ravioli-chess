from dataclasses import dataclass

from app.challenge.service import make_challenge_service

from .matchmaking.service import MatchMakingService, make_mm_service


@dataclass(slots=True, frozen=True)
class Env:
    matchmaking: MatchMakingService

    @staticmethod
    def make():
        mm = make_mm_service(make_challenge_service())
        return Env(matchmaking=mm)
