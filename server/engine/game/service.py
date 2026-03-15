"""import secrets
import string

from sqlalchemy import select

from core.db.models import User
from engine.deps import LocalSession


def id8():
    return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))"""
