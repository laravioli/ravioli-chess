from dataclasses import dataclass

from redis.asyncio import Redis

from app.challenge.service import ChallengeService, make_challenge_service

from .matchmaking.service import MatchMakingService, make_mm_service


@dataclass(slots=True, frozen=True)
class Env:
    challenge: ChallengeService
    matchmaking: MatchMakingService

    @staticmethod
    def make(redis: Redis):
        challenge = make_challenge_service(redis=redis)
        matchmaking = make_mm_service(challenge)
        return Env(challenge=challenge, matchmaking=matchmaking)
