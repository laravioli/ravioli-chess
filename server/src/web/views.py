from .models import ChessOpeningPosition as c
from django.shortcuts import render
from mysite.settings import DEBUG


def index(request):

    context = {"openings": list(c.objects.values("eco", "name", "fen").order_by("eco"))}

    response = render(request, "web/index.html", context)

    return response
