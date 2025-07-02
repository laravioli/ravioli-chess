from django.views.decorators.csrf import ensure_csrf_cookie
from .models import ChessOpeningPosition as c
from django.shortcuts import render
from django.http import HttpResponse


"""async def index(request):
    return HttpResponse("h")"""


"""def index(request):
    return HttpResponse("hello")"""


@ensure_csrf_cookie
def index(request):
    queryset = c.objects.values("eco", "name", "fen").order_by("eco")
    context = {"openings": list(queryset)}

    return render(request, "web/index.html", context)
