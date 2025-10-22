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

    @classmethod
    def default_profile(cls) -> dict:
        return {
            "board": cls.BoardChoices.WOOD,
            "pieceset": cls.PieceSetChoices.BASE,
        }

    def to_dict(self) -> dict:
        return model_to_dict(self, exclude=["user"])

    def __str__(self) -> str:
        return self.user.username
