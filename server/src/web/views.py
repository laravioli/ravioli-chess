from django.views.decorators.csrf import ensure_csrf_cookie
from .models import ChessOpeningPosition as c
from django.shortcuts import render

@ensure_csrf_cookie
def index(request):
    queryset = c.objects.values("eco", "name", "fen").order_by("eco")
    context = {"to_json" : {"cfg" : {"fen" : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"},
                            "data": {"positions" : list(queryset)}
                            }
              }
    
    return render(request, "web/index.html", context)
