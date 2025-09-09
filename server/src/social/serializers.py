from rest_framework import serializers
from .models import FriendList


class FriendListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    friends = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="username"
    )

    class Meta:
        model = FriendList
        fields = ["username", "friends"]
