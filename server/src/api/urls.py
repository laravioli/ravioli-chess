from django.urls import path, include
from rest_framework.routers import DefaultRouter
from social.views import FriendListViewSet
from user.views import UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"friends", FriendListViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
