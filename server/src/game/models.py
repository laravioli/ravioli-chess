from django.db import models
from django.contrib.auth.models import User


class Game(models.Model):

    class Status(models.TextChoices):
        CREATED = "CREATED"
        CANCELLED = "CANCELED"
        COMPLETED = "COMPLETED"
        PENDING = "PENDING"

    game_id = models.CharField(max_length=14, unique=True)
    white_player = models.ForeignKey(
        User, models.CASCADE, related_name="game_as_white", blank=True, null=True
    )

    black_player = models.ForeignKey(
        User, models.CASCADE, related_name="game_as_black", blank=True, null=True
    )

    status = models.CharField(max_length=24, choices=Status)
    data = models.JSONField(blank=True, null=True)
    pub_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.game_id

    class Meta:
        get_latest_by = "pub_date"
        ordering = ["pub_date"]
