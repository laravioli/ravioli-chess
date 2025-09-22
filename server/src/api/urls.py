from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user.views import UserListViewSet
from social.views import FriendViewSet, FriendRequestViewSet


router = DefaultRouter()
router.register(r"users", UserListViewSet, basename="users")
router.register(r"friends", FriendViewSet, basename="friend")
router.register(r"friends/requests", FriendRequestViewSet, basename="friend-request")

urlpatterns = [path("", include(router.urls)), path("user/", include("user.urls"))]
