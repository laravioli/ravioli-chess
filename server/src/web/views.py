from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from .context import make_context


@ensure_csrf_cookie
def index(request, **kwargs):
    context = make_context(request.user, **kwargs)
    return render(request, "web/index.html", context)
