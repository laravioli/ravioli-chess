from app.api.schemas import BaseSchema


# In
class FriendRequest(BaseSchema):
    to: str
