from django.urls import path
from django.urls import re_path
from django.views.decorators.cache import never_cache


from . import views

app_name = "web"
urlpatterns = [
    path("", never_cache(views.index), name="index"),
    re_path(
        r"^(?P<page>[-\w]+)(?P<slug>/[-\w]+)?$",
        never_cache(views.index),
        name="generic_page",
    ),
]
