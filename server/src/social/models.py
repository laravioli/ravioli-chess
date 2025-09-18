from django.db import models
from django.db.models import Q
from django.conf import settings


class FriendList(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendlist"
    )
    friends = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="friend_of"
    )

    def __str__(self):
        return self.user.username

    def add_friend(self, friend):
        """add a new Friend to user and ensure bidirectionnal friendship"""

        if friend == self.user:
            return
        if not self.is_friend(friend):
            self.friends.add(friend)
            FriendList.objects.get(user=friend).friends.add(self.user)

    def remove_friend(self, friend):
        """remove bidirectionnal friendship"""

        if self.is_friend(friend):
            self.friends.remove(friend)
            FriendList.objects.get(user=friend).friends.remove(self.user)

    def is_friend(self, friend):
        return self.friends.contains(friend)


class FriendRequestQuerySet(models.QuerySet):
    def pending(self):
        return self.filter(status=FriendRequest.Status.PENDING)

    def accepted(self):
        return self.filter(status=FriendRequest.Status.ACCEPTED)

    def rejected(self):
        return self.filter(status=FriendRequest.Status.REJECTED)

    def cancelled(self):
        return self.filter(status=FriendRequest.Status.CANCELLED)

    def between(self, user1, user2):
        return self.filter(
            Q(sender=user1, receiver=user2) | Q(sender=user2, receiver=user1)
        )


class FriendRequest(models.Model):

    objects = FriendRequestQuerySet.as_manager()

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_friend_request",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_friend_request",
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def accept(self):
        if self.status != FriendRequest.Status.PENDING:
            raise ValueError("Cannot accept a non-pending request")
        receiver_fl = FriendList.objects.get(user=self.receiver)
        receiver_fl.add_friend(self.sender)
        self.status = FriendRequest.Status.ACCEPTED
        self.save()

    def decline(self):
        self.status = FriendRequest.Status.REJECTED
        self.save()

    def cancel(self):
        self.status = FriendRequest.Status.CANCELLED
        self.save()

    def __str__(self):
        return f"FriendRequest from {self.sender.username} to {self.receiver.username} [{self.status}]"
