from django.urls import path, include
from rest_framework.routers import DefaultRouter
from social.views import FriendsViewSet

# from social.views import FriendListViewSet

router = DefaultRouter()
router.register(r"friends", FriendsViewSet, basename="friend")

urlpatterns = [path("", include(router.urls)), path("user/", include("user.urls"))]
