from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data["email"],
        )

        return user

    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
