from rest_framework import serializers
from .models import Game


class GameSerializer(serializers.ModelSerializer):
    white_player = serializers.SlugRelatedField(slug_field="username", read_only=True)
    black_player = serializers.SlugRelatedField(slug_field="username", read_only=True)

    class Meta:
        model = Game
        fields = ["game_id", "white_player", "black_player", "pub_date", "data"]
