from django.views.decorators.csrf import ensure_csrf_cookie
from .models import ChessOpeningPosition as c
from django.shortcuts import render


@ensure_csrf_cookie
def index(request):

    context = {"openings": list(c.objects.values("eco", "name", "fen").order_by("eco"))}

    response = render(request, "web/index.html", context)

    return response
