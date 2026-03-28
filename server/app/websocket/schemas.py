from app.user.schemas import UserBase


class User(UserBase):
    is_active: bool
    is_staff: bool
