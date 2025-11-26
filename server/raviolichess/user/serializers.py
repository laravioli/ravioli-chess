from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

user_model = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user_model
        fields = ["username"]


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=4)
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=user_model.objects.all(),
                message="Email address invalid or already taken",
            )
        ]
    )

    def create(self, validated_data):

        user = user_model.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
        return user

    class Meta:
        model = user_model
        fields = ["email", "username", "password"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"})

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)

        if not user:
            msg = "Unable to log in with provided credentials."
            raise serializers.ValidationError(msg)

        data["user"] = user
        return data
