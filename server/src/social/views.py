from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .permissions import IsSelfOrIsFriend, IsAdminOrIsSelf
from .models import FriendList
from .serializers import FriendListSerializer
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema


class FriendsViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = FriendList.objects.prefetch_related("user").all()
    serializer_class = FriendListSerializer
    lookup_field = "user__username"

    def get_permissions(self):
        if self.action == "retrieve":
            permission_classes = [IsSelfOrIsFriend]
        else:
            permission_classes = [IsAdminOrIsSelf]
        return [permission() for permission in permission_classes]

    @extend_schema(operation_id="remove_friend")
    @action(detail=True, methods=["post"])
    def remove(self, request, user__username=None):
        obj: FriendList = get_object_or_404(self.get_queryset(), user=request.user)
        self.check_object_permissions(self.request, obj)
        friend = get_object_or_404(obj.friends, username=user__username)
        obj.remove_friend(friend)
        return Response(
            {"detail": f"Successfully remove {user__username}"},
            status=status.HTTP_200_OK,
        )


class FriendRequestViewSet(viewsets.GenericViewSet):
    pass
