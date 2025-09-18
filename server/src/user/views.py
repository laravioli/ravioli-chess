from rest_framework import permissions, generics, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from rest_framework import status
from user.serializers import RegisterSerializer, LoginSerializer, AuthDetailSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view


@extend_schema_view(post=extend_schema(operation_id="user_register"))
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        operation_id="user_login",
        responses={200: AuthDetailSerializer, 400: AuthDetailSerializer},
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            login(request, user)
            return Response(
                {"detail": "Successfully logged in"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"detail": serializer.errors["non_field_errors"][0]},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        operation_id="user_logout", request=None, responses=AuthDetailSerializer
    )
    def post(self, request):
        logout(request)
        reponse = Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )

        return reponse
