import uuid
import datetime
from django.conf import settings


class CookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        cookie = request.COOKIES.get("anon")
        set_cookie = False
        delete_cookie = False

        response = self.get_response(request)

        if request.user.is_authenticated:
            if cookie:
                delete_cookie = True
        elif not cookie:
            set_cookie = True

        if delete_cookie:
            response.delete_cookie("anon")
        elif set_cookie:
            response.set_cookie(
                "anon",
                str(uuid.uuid4()),
                max_age=datetime.timedelta(days=365),
                secure=settings.SSL,
                httponly=True,
                samesite="Lax",
            )
        return response
