from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in
from .models import Profile, SESSION_KEY

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_preference(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(user_logged_in)
def cache_profile_in_session(sender, request, user, **kwargs):
    """cache preferences in session. override user_preferences from anon session"""
    if hasattr(user, "profile"):
        request.session[SESSION_KEY] = user.profile.to_dict()
