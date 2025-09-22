from rest_framework import permissions
from .models import Friend
from django.contrib.auth import get_user_model
from rest_framework.views import View
from rest_framework.request import Request
from django.shortcuts import get_object_or_404


user_model = get_user_model()


class IsSelfOrFriend(permissions.BasePermission):
    """Give permissions to user and his friends"""

    def has_permission(self, request: Request, view: View):
        user_username = request.query_params.get("username")
        if user_username and user_username != request.user.username:
            view.target_user = get_object_or_404(user_model, username=user_username)
            return Friend.objects.filter(
                from_user=request.user, to_user=view.target_user
            ).exists()
        else:
            view.target_user = request.user
            return True
