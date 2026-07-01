from typing import Annotated

from fastapi import Depends
from fastapi.requests import Request

from app.challenge.service import ChallengeService

from .env import Env
from .matchmaking.service import MatchMakingService


async def get_env(req: Request) -> Env:
    return req.state["env"]


type EnvDep = Annotated[Env, Depends(get_env)]


async def get_chall(env: EnvDep):
    return env.challenge


async def get_mm(env: EnvDep):
    return env.matchmaking


type ChallengeDep = Annotated[ChallengeService, Depends(get_chall)]
type MatchmakingDep = Annotated[MatchMakingService, Depends(get_mm)]
