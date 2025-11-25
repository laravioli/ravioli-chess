from rest_framework import permissions, generics, viewsets
from .models import Game
from .serializers import GameSerializer
from api.pagination import LargeResultsSetPagination
from django.db.models import Q


class GameListViewSet(generics.ListAPIView, viewsets.GenericViewSet):
    queryset = (
        Game.objects.filter(status="COMPLETED")
        .select_related("white_player", "black_player")
        .order_by("-pub_date")
    )
    permission_classes = [permissions.AllowAny]
    serializer_class = GameSerializer
    pagination_class = LargeResultsSetPagination

    def get_queryset(self):
        queryset = self.queryset
        if self.action == "list":
            username = self.request.query_params.get("username")
            if username is not None:
                queryset = queryset.filter(
                    Q(white_player__username__iexact=username)
                    | Q(black_player__username__iexact=username)
                )
        return queryset
