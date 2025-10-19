from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in
from .models import Preference

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs):
    if created:
        Preference.objects.create(user=instance)


@receiver(user_logged_in)
def cache_preference_in_session(sender, request, user, **kwargs):
    """cache preferences in session. override user_preferences from anon session"""
    if hasattr(user, "preference"):
        request.session["user_preferences"] = user.preference.to_dict()
