from django.contrib import admin
from .models import Friend, FriendRequest


class FriendAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "created")
    search_fields = ("from_user__username", "to_user__username")
    list_filter = ("from_user", "to_user")


class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "created")
    search_fields = ("from_user__username", "to_user__username")
    list_filter = ("from_user", "to_user")


admin.site.register(Friend, FriendAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)
