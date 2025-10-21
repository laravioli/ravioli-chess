from .models import Preference, SESSION_KEY_PREFERENCE
from rest_framework import serializers


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ["board", "pieces"]
