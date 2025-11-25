from .models import Profile
from rest_framework import serializers


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["board", "pieceset"]


class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["board"]
        extra_kwargs = {"board": {"required": True}}


class PieceSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["pieceset"]
        extra_kwargs = {"pieceset": {"required": True}}
