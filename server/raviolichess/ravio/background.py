from abc import ABC, abstractmethod
from raviolichess.ipc.channels import Channel
from typing import TypeVar, Generic

T = TypeVar("T", bound=Channel)


class BackgroundSubscriber(ABC, Generic[T]):
    """interface for subscribing to a pubsub channel during the application lifetime.
    In order to be active, a background subscriber need to call Background.register"""

    @property
    @abstractmethod
    def channel(self) -> T: ...

    @abstractmethod
    async def on_message(self, message) -> None:
        """callback when a message arrive in a channel"""
        ...


class Background:
    _registry = {}

    @classmethod
    def register(cls, instance: BackgroundSubscriber[T]):
        """add a background subscriber to registry"""
        assert isinstance(instance, BackgroundSubscriber)
        cls._registry[instance.channel] = instance.on_message

    @classmethod
    def all(cls):
        return cls._registry
