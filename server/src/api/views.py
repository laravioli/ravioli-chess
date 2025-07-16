from rest_framework import generics
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from api.serializers import RegisterSerializer


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


#todo : remove this and do json script payload
class UserSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {"isAuthenticated": True, "username": request.user.username},
            status=status.HTTP_200_OK,
        )


def whoami_view(request):
    if not request.user.is_authenticated:
        return Response({"isAuthenticated": False})

    return Response({"username": request.user.username})
