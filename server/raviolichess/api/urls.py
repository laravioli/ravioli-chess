from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user.views import UserListViewSet
from social.views import FriendViewSet, FriendRequestViewSet
from profile.views import ProfileViewSet
from game.views import GameListViewSet


router = DefaultRouter()
router.register(r"users", UserListViewSet, basename="users")
router.register(r"friends", FriendViewSet, basename="friend")
router.register(r"friends/requests", FriendRequestViewSet, basename="friend-request")
router.register(r"profile", ProfileViewSet, basename="profile")
router.register(r"games", GameListViewSet, basename="games")

urlpatterns = [path("", include(router.urls)), path("user/", include("user.urls"))]
