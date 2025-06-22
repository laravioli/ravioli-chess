from django.urls import path
from api import views

urlpatterns = [
    path("register/", views.UserRegister.as_view(), name="user-register"),
    path("login/", views.UserLogin.as_view(), name="user-login"),
    path("logout/", views.user_logout, name="user-logout"),
    path("whoami/", views.whoami_view, name="user-whoami"),
]
