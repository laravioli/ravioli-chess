from django.urls import path, include
from rest_framework.routers import DefaultRouter
from social.views import FriendViewSet, FriendRequestViewSet

# from social.views import FriendListViewSet

router = DefaultRouter()
router.register(r"friends", FriendViewSet, basename="friend")
router.register(r"friend/requests", FriendRequestViewSet, basename="friend-request")

urlpatterns = [path("", include(router.urls)), path("user/", include("user.urls"))]
