from dataclasses import dataclass

from redis.asyncio import Redis

from app.challenge.service import ChallengeService, make_challenge_service
from app.notif.service import NotifService, make_notif_service
from app.social.service import SocialService, make_social_service
from app.web.service import WebService, make_web_service


@dataclass(slots=True)
class Services:
    web: WebService
    notif: NotifService
    social: SocialService
    challenge: ChallengeService

    @staticmethod
    def make(redis: Redis):
        web = make_web_service(redis=redis)
        notif = make_notif_service(redis=redis)
        social = make_social_service(notif=notif)
        challenge = make_challenge_service()
        return Services(web=web, notif=notif, social=social, challenge=challenge)
