from .serializers import FriendRequestSerializer, FriendSerializer, EmptySerializer
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from .permissions import AreFriends
from .models import FriendRequest, Friend
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema


user_model = get_user_model()


class FriendRequestViewSet(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin
):
    permission_classes = [IsAuthenticated]
    serializer_class = FriendRequestSerializer
    queryset = FriendRequest.objects.all()
    lookup_field = "pk"

    def get_queryset(self):
        user = self.request.user
        return FriendRequest.objects.filter(to_user=user).select_related("from_user")

    @extend_schema(
        operation_id="friend_request_accept",
    )
    @action(methods=["post"], detail=True, serializer_class=EmptySerializer)
    def accept(self, request, pk=None):
        friend_request = get_object_or_404(
            request.user.friendship_requests_received, pk=pk
        )
        friend_request.accept()
        return Response(
            {
                "detail": f"Successfully accepted friend request from {friend_request.from_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    @extend_schema(operation_id="friend_request_reject")
    @action(methods=["delete"], detail=True)
    def reject(self, request, pk=None):
        friend_request = get_object_or_404(
            request.user.friendship_requests_received, pk=pk
        )
        friend_request.reject()
        return Response(
            {
                "detail": f"Successfully rejected request from {friend_request.from_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    @extend_schema(operation_id="friend_request_cancel")
    @action(methods=["delete"], detail=True)
    def cancel(self, request, pk=None):
        friend_request = get_object_or_404(request.user.friendship_requests_sent, pk=pk)
        friend_request.cancel()
        return Response(
            {
                "detail": f"Successfully cancelled request to {friend_request.to_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )


class FriendViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    permission_classes = [IsAuthenticated, AreFriends]
    serializer_class = FriendSerializer
    queryset = Friend.objects.all()
    lookup_field = "pk"

    def get_queryset(self):
        user = self.request.user
        return Friend.objects.filter(from_user=user).select_related("to_user")

    @extend_schema(operation_id="friend_remove")
    @action(methods=["delete"], detail=True)
    def remove(self, request, pk=None):
        user = request.user
        to_user = user_model.objects.get(pk=pk)
        Friend.remove_friend(from_user=user, to_user=to_user)
        return Response(
            {f"detail": "Successfully removed {to_user.username} from your friends"}
        )
