from piccolo.columns.column_types import UUID, Boolean, Bytea, Timestamptz, Varchar
from piccolo.columns.defaults.timestamptz import TimestamptzNow
from piccolo.columns.defaults.uuid import UUID4
from piccolo.table import Table


class User(Table, tablename="user_account"):
    id = UUID(primary_key=True, default=UUID4())
    username = Varchar(length=16, unique=True, default=None)
    email = Varchar(length=255, unique=True, default=None)
    hashed_password = Bytea(secret=True, default=None)
    is_staff = Boolean(default=False)
    is_active = Boolean(default=True)
    joined_at = Timestamptz(default=TimestamptzNow())
