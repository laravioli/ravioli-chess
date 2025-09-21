from django.db import models
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class FriendRequest(models.Model):
    """Model to represent friendship requests"""

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_requests_sent",
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="friendship_requests_received",
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("from_user", "to_user")

    @classmethod
    def send_request(cls, from_user, to_user):
        """Create a friendship request"""
        if from_user == to_user:
            raise ValidationError("Users cannot be friends with themselves")

        if Friend.are_friends(from_user, to_user):
            raise ValidationError("Users are already friends")

        if cls.objects.filter(from_user=from_user, to_user=to_user).exists():
            raise ValidationError("You already requested friendship from this user.")

        if cls.objects.filter(from_user=to_user, to_user=from_user).exists():
            raise ValidationError("This user already requested friendship from you.")

        request, created = cls.objects.get_or_create(
            from_user=from_user, to_user=to_user
        )

        if created is False:
            raise ValidationError("Friendship already requested")

        return request

    def accept(self):
        """Accept this friendship request"""
        Friend.objects.create(from_user=self.from_user, to_user=self.to_user)
        Friend.objects.create(from_user=self.to_user, to_user=self.from_user)

        self.delete()

        # Delete any reverse requests
        FriendRequest.objects.filter(
            from_user=self.to_user, to_user=self.from_user
        ).delete()

    def reject(self):
        """reject this friendship request"""
        self.delete()

    def cancel(self):
        """cancel this friendship request"""
        self.delete()

    def __str__(self):
        return f"User #{self.from_user.username} friendship requested #{self.to_user.username}"


class Friend(models.Model):
    """Model to represent Friendships"""

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="_unused_friend_relation",
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friends"
    )
    created = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("from_user", "to_user")

    @classmethod
    def are_friends(self, user1, user2):
        """Are these two users friends?"""
        return Friend.objects.filter(to_user=user1, from_user=user2).exists()

    def remove_friend(self, from_user, to_user):
        """Remove a friendship relationship"""
        try:
            qs = Friend.objects.filter(
                to_user__in=[to_user, from_user], from_user__in=[from_user, to_user]
            )
            if qs:
                qs.delete()
                return True
            else:
                return False
        except Friend.DoesNotExist:
            return False

    def save(self, *args, **kwargs):
        # Ensure users can't be friends with themselves
        if self.to_user == self.from_user:
            raise ValidationError("Users cannot be friends with themselves.")
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"User #{self.to_user.username} is friends with #{self.from_user.username}"
        )
