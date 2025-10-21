from django.db import models
from django.forms import model_to_dict
from django.conf import settings


class Preference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True
    )

    class BoardChoices(models.TextChoices):
        WOOD = "wood"
        BLUE = "blue"
        BLUE2 = "blue2"
        BROWN = "brown"

    board = models.CharField(
        max_length=15, choices=BoardChoices, default=BoardChoices.WOOD
    )

    class PiecesChoices(models.TextChoices):
        BASE = "base"
        WIKI = "wiki"

    pieces = models.CharField(
        max_length=15, choices=PiecesChoices, default=PiecesChoices.BASE
    )

    def to_dict(self):
        return model_to_dict(self, exclude=["user"])

    def __str__(self):
        return f"Preference {self.user.username}"


DEFAULT_PREFERENCE = {
    "board": Preference.BoardChoices.WOOD,
    "pieces": Preference.PiecesChoices.BASE,
}

SESSION_KEY_PREFERENCE = "user_preferences"
