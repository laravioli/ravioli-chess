from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ChessOpeningPosition
from django.core.cache import cache


@receiver([post_save, post_delete], sender=ChessOpeningPosition)
def invalidate_chess_openings_cache(sender, instance, **kwargs):
    cache.delete(ChessOpeningPosition.CACHE_KEY)
