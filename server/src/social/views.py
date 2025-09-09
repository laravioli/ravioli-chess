from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import isOwnerOrFriend
from .models import FriendList
from django.contrib.auth.models import User
from .serializers import FriendListSerializer
from django.shortcuts import get_object_or_404


class FriendListViewSet(
    viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin
):
    permission_classes = [IsAuthenticated, isOwnerOrFriend]
    queryset = FriendList.objects.prefetch_related("user").all()
    serializer_class = FriendListSerializer
    lookup_field = "user__username"

    @action(detail=True, methods=["post"])
    def remove(self, request, user__username=None):
        obj = get_object_or_404(self.get_queryset(), user=request.user)
        self.check_object_permissions(self.request, obj)
        friend_to_remove = get_object_or_404(obj.friends, username=user__username)
        obj.unfriend(friend_to_remove)
        return Response(
            {"detail": f"Successfully remove {user__username}"},
            status=status.HTTP_200_OK,
        )
