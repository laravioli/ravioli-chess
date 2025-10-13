from django.db import models


class ChessOpeningPosition(models.Model):

    eco = models.CharField(max_length=3)
    name = models.CharField(max_length=200)
    fen = models.CharField(max_length=92)

    CACHE_KEY = "chess:opening_positions"

    def __str__(self):
        return self.name
