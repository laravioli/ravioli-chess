from fastapi import Request

from app.auth.deps import UserWithPrefOrAnon


async def add_user_to_request(request: Request, user: UserWithPrefOrAnon):
    pass
