from rest_framework import serializers
from django.contrib.auth.models import User
from social.models import FriendList
from rest_framework.validators import UniqueValidator


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=4)
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Email address invalid or already taken",
            )
        ]
    )

    def create(self, validated_data):

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
        return user

    class Meta:
        model = User
        fields = ["email", "username", "password"]
