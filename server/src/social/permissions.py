from rest_framework import permissions
from .models import Friend
from django.contrib.auth import get_user_model
from rest_framework.views import View
from rest_framework.request import Request
from django.core.exceptions import ObjectDoesNotExist

user_model = get_user_model()


class AreFriends(permissions.BasePermission):
    """Give permissions to user and his friends"""

    def has_permission(self, request: Request, view: View):
        target_user_id = view.kwargs.get("pk")
        if not target_user_id:
            return False
        try:
            target_user = user_model.objects.get(pk=target_user_id)
        except ObjectDoesNotExist:
            return False

        return Friend.are_friends(user1=request.user, user2=target_user)
