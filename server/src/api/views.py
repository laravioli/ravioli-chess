from rest_framework import generics
from rest_framework import permissions
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from api.serializers import RegisterSerializer


@method_decorator(csrf_protect, name="post")
class UserRegister(generics.CreateAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


@method_decorator(csrf_protect, name="post")
class UserLogin(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print(request)
        username = request.data["username"]
        password = request.data["password"]
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return Response(
                {"success": "Successfully logged in"}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


def user_logout(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return Response(
                {"error": "You're not logged in."}, status=status.HTTP_400_BAD_REQUEST
            )

        logout(request)
        return Response({"success": "Successfully logged out."})


def whoami_view(request):
    if not request.user.is_authenticated:
        return Response({"isAuthenticated": False})

    return Response({"username": request.user.username})
