import secrets
import string


def id8():
    return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
