from itsdangerous import Signer

from app.config import settings

signer = Signer(secret_key=settings.SECRET_KEY.get_secret_value(), salt="ravioli.cookie")
