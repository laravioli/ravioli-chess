from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from raviolichess.api.serializers import EmptyRequestSerializer
from raviolichess.api.pagination import SmallResultsSetPagination
from .models import FriendRequest, Friend
from .serializers import FriendRequestSerializer, FriendSerializer


user_model = get_user_model()


class FriendRequestViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    pagination_class = SmallResultsSetPagination
    permission_classes = [IsAuthenticated]
    serializer_class = FriendRequestSerializer
    queryset = FriendRequest.objects.all()
    lookup_field = "pk"

    def get_queryset(self):
        if self.action == "list":
            return (
                FriendRequest.objects.filter(
                    Q(from_user=self.request.user) | Q(to_user=self.request.user)
                )
                .select_related("from_user", "to_user")
                .order_by("-created")
            )
        elif self.action == "sent":
            return (
                FriendRequest.objects.filter(from_user=self.request.user)
                .select_related("to_user")
                .order_by("-created")
            )
        elif self.action in ["received", "accept", "reject"]:
            return (
                FriendRequest.objects.filter(to_user=self.request.user)
                .select_related("from_user")
                .order_by("-created")
            )
        else:
            return self.queryset

    @action(detail=False, methods=["get"])
    def sent(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(
        operation_id="friend_request_accept",
    )
    @action(methods=["post"], detail=True, serializer_class=EmptyRequestSerializer)
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        friend_request.accept()
        return Response(
            {
                "detail": f"Successfully accepted friend request from {friend_request.from_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=["get"])
    def received(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @extend_schema(operation_id="friend_request_reject")
    @action(methods=["post"], detail=True, serializer_class=EmptyRequestSerializer)
    def reject(self, request, pk=None):
        friend_request = self.get_object()
        friend_request.reject()
        return Response(
            {
                "detail": f"Successfully rejected request from {friend_request.from_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    @extend_schema(operation_id="friend_request_cancel")
    @action(methods=["post"], detail=True, serializer_class=EmptyRequestSerializer)
    def cancel(self, request, pk=None):
        friend_request = get_object_or_404(request.user.friendship_requests_sent, pk=pk)
        friend_request.cancel()
        return Response(
            {
                "detail": f"Successfully cancelled request to {friend_request.to_user.username}"
            },
            status=status.HTTP_204_NO_CONTENT,
        )


class FriendViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """End point to list and remove friends"""

    permission_classes = [IsAuthenticated]
    serializer_class = FriendSerializer
    queryset = Friend.objects.all()
    lookup_field = "pk"

    def get_queryset(self):
        if self.action == "list":
            user_username = self.request.query_params.get("username")
            if not user_username and self.request.user.is_authenticated:
                user_username = self.request.user
            target_user = get_object_or_404(user_model, username=user_username)
            return (
                Friend.objects.filter(from_user=target_user)
                .select_related("to_user")
                .order_by("-created")
            )
        else:
            return self.queryset

    @extend_schema(operation_id="friend_remove")
    @action(methods=["post"], detail=False)
    def remove(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        to_user = serializer.validated_data["to_user"]
        Friend.remove_friend(from_user=request.user, to_user=to_user)
        return Response(
            {"detail": f"Successfully removed {to_user.username} from your friends"}
        )
