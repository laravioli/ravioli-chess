from django.db import models
from django.forms import model_to_dict
from django.conf import settings


class Profile(models.Model):
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

    class PieceSetChoices(models.TextChoices):
        BASE = "base"
        WIKI = "wiki"

    pieceset = models.CharField(
        max_length=15, choices=PieceSetChoices, default=PieceSetChoices.BASE
    )

    def to_dict(self):
        return model_to_dict(self, exclude=["user"])

    def __str__(self):
        return f"Profile {self.user.username}"


ANON_PROFILE = {
    "board": Profile.BoardChoices.WOOD,
    "pieceset": Profile.PieceSetChoices.BASE,
}

SESSION_KEY = "profile"
