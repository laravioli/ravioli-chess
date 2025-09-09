from rest_framework import viewsets, mixins, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from user.serializers import RegisterSerializer


class UserViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @action(detail=False, methods=["post"])
    def login(self, request):
        username = request.data["username"]
        password = request.data["password"]
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return Response(
                {"detail": "Successfully logged in"}, status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    @action(
        detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def logout(self, request):
        logout(request)
        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )
