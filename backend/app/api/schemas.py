from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        str_strip_whitespace=True,
        use_enum_values=False,
    )


class Message(BaseModel):
    message: str


class Redirect(BaseModel):
    redirect: str
