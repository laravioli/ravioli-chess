from .models import ChessOpeningPosition as c
from django.shortcuts import render


def index(request):

    context = {"openings": list(c.objects.values("eco", "name", "fen").order_by("eco"))}

    response = render(request, "web/index.html", context)
    response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"

    return response
