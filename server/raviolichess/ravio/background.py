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


class BackgroundRegistry:

    def __init__(self):
        self._registry: dict[str, BackgroundSubscriber] = {}

    def register(self, name, instance: BackgroundSubscriber[T]):
        """add a background subscriber to registry"""
        assert isinstance(instance, BackgroundSubscriber)
        self._registry[name] = instance

    def get_subscriptions(self) -> dict:
        return {
            instance.channel: instance.on_message
            for instance in self._registry.values()
        }

    def get(self, key):
        return self._registry[key]
