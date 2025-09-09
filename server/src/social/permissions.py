from rest_framework import permissions


class isOwnerOrFriend(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        isOwner = obj.user == request.user
        if request.method in permissions.SAFE_METHODS:
            return isOwner or request.user in obj.friends.all()
        else:
            return isOwner
