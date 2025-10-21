from .models import Profile, SESSION_KEY
from rest_framework import serializers


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["board", "pieces"]
