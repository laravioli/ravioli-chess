from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from .context import make_context

# todo : finish piece.html (same as lichess with template <style><style/>)
# make the api, session read/write + user pref write
# update schema and implement client


@ensure_csrf_cookie
def index(request, **kwargs):
    print(dict(request.session))
    context = make_context(request, **kwargs)
    return render(request, "web/index.html", context)
