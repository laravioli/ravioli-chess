import datetime
from urllib.parse import parse_qsl, urlencode
from django.core.signing import BadSignature
from django.conf import settings
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from .models import Profile
from .serializers import ProfileSerializer, BoardSerializer, PieceSetSerializer


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()

    @extend_schema(
        operation_id="profile_board_update",
    )
    @action(detail=False, methods=["put"], serializer_class=BoardSerializer)
    def board(self, request):
        return self._update_profile(request)

    @extend_schema(
        operation_id="profile_pieceset_update",
    )
    @action(detail=False, methods=["put"], serializer_class=PieceSetSerializer)
    def pieceset(self, request):
        return self._update_profile(request)

    def _update_profile(self, request):
        if request.user.is_authenticated:
            return self._update_user_profile(request)
        else:
            return self._update_anon_profile(request)

    def _update_user_profile(self, request):
        instance, _ = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "OK"}, status=status.HTTP_200_OK)

    def _update_anon_profile(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_data = get_cookie_data(request)
        merged_data = old_data | serializer.validated_data
        query_string = urlencode(merged_data)
        response = Response({"detail": "OK"}, status=status.HTTP_200_OK)
        response.set_signed_cookie(
            "anon",
            query_string,
            max_age=datetime.timedelta(days=365),
            secure=settings.SSL,
            httponly=False,
            samesite="Lax",
        )
        return response


def get_cookie_data(request):
    try:
        cookie = request.get_signed_cookie("anon", False)
    except BadSignature:
        request.delete_cookie("anon")
        cookie = False
    if not cookie:
        return {}
    data = dict(parse_qsl(cookie))
    serializer = ProfileSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data
