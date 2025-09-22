from .models import Friend, FriendRequest
from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_serializer

user_model = get_user_model()


@extend_schema_serializer(component_name="FriendReqSerializer")
class FriendRequestSerializer(serializers.ModelSerializer):

    from_user = serializers.SlugRelatedField(slug_field="username", read_only=True)
    to_user = serializers.SlugRelatedField(
        queryset=user_model.objects.all(), slug_field="username"
    )

    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user", "created"]

    def create(self, validated_data):
        from_user = self.context["request"].user
        to_user = validated_data["to_user"]
        return FriendRequest.send_request(from_user=from_user, to_user=to_user)


class FriendSerializer(serializers.ModelSerializer):
    to_user = serializers.SlugRelatedField(
        queryset=user_model.objects.all(), slug_field="username"
    )

    class Meta:
        model = Friend
        fields = ["to_user", "created"]
