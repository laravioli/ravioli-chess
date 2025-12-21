from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field, SecretStr, StringConstraints, ValidationInfo


def check_passwords_match(value: str, info: ValidationInfo) -> str:
    if value != info.data["password"]:
        raise ValueError("Passwords do not match")
    return value


class UserCreate(BaseModel):
    username: Annotated[
        str,
        StringConstraints(
            min_length=3, max_length=150, pattern=r"^[\w.@+-]+$", strip_whitespace=True
        ),
    ]
    password: Annotated[SecretStr, Field(min_length=6)]
    password_repeat: Annotated[SecretStr, AfterValidator(check_passwords_match)]


# Define once at module level
# users_adapter = TypeAdapter(list[User])

# @app.get("/users")
# def get_users():
# data = db.get_all_users()
# Manual serialization is often 2-3x faster for large lists
# return Response(content=users_adapter.dump_json(data), media_type="application/json")
