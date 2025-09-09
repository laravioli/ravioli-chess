from django.urls import path
from user import views

urlpatterns = [
    path("register/", views.UserRegister.as_view(), name="user-register"),
    path("login/", views.UserLogin.as_view(), name="user-login"),
    path("logout/", views.UserLogout.as_view(), name="user-logout"),
]
