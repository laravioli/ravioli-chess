from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user.views import UserListViewSet
from social.views import FriendViewSet, FriendRequestViewSet
from profile.views import ProfileViewSet


router = DefaultRouter()
router.register(r"users", UserListViewSet, basename="users")
router.register(r"friends", FriendViewSet, basename="friend")
router.register(r"friends/requests", FriendRequestViewSet, basename="friend-request")
router.register(r"profile", ProfileViewSet, basename="profile")

urlpatterns = [path("", include(router.urls)), path("user/", include("user.urls"))]
