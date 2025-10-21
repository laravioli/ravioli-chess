from rest_framework import viewsets
from .models import Profile, SESSION_KEY
from .serializers import ProfileSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()

    @extend_schema(
        operation_id="profile_change",
    )
    @action(detail=False, methods=["put"])
    def change(self, request):
        if request.user.is_authenticated:
            instance, _ = Profile.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(instance, data=request.data)
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        if request.user.is_authenticated:
            serializer.save()

        request.session.setdefault(SESSION_KEY, {}).update(self.validated_data)
        request.session.modified = True

        return Response({"detail": "OK"}, status=status.HTTP_200_OK)
