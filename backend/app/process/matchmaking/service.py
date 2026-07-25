from app.challenge.service import ChallengeService


class MatchMakingService:
    def __init__(self, challenge: ChallengeService):
        self._challenge = challenge

    async def ai(self):
        pass

    async def friend(self):
        pass

    async def random(self):
        pass

    @staticmethod
    def make(*, challenge: ChallengeService):
        return MatchMakingService(challenge=challenge)
