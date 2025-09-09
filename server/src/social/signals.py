from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from social.models import FriendList


@receiver(post_save, sender=User)
def user_save(sender, instance, **kwargs):
    FriendList.objects.get_or_create(user=instance)
