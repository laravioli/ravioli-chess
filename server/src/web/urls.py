from django.urls import path
from django.urls import re_path


from . import views

app_name = "web"
urlpatterns = [
    path("", views.index, name="index"),
    re_path(r"^(?P<page>[-\w]+)(?P<slug>/[-\w]+)?$", views.index, name="generic_page"),
]
