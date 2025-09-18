from rest_framework import permissions
from .models import FriendList


class IsSelfOrIsFriend(permissions.BasePermission):
    """Give all object permissions to owner and READ-ONLY permissions to owner's friends"""

    def has_object_permission(self, request, view, obj: FriendList):
        isSelf = obj.user == request.user
        if request.method in permissions.SAFE_METHODS:
            return isSelf or obj.isfriend(request.user)
        else:
            return isSelf


class IsAdminOrIsSelf(permissions.BasePermission):
    """Give all object permissions to staff member or owner"""

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and (request.user.is_staff or request.user == obj.user)
        )
