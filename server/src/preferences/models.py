from django.db import models
from django.forms import model_to_dict
from django.conf import settings


DEFAULT_PREF = {"board": "wood", "pieces": "base"}


class Preference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True
    )
    board = models.CharField(max_length=15, default=DEFAULT_PREF.get("board"))
    pieces = models.CharField(max_length=15, default=DEFAULT_PREF.get("pieces"))

    def to_dict(self):
        return model_to_dict(self, exclude=["user"])

    def __str__(self):
        return f"Preference {self.user.username}"
