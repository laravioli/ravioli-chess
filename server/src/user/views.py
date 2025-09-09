from rest_framework import generics
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from user.serializers import RegisterSerializer


from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from django.contrib.auth.models import User


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


class UserRegister(generics.CreateAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserLogin(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
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


class UserLogout(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )
