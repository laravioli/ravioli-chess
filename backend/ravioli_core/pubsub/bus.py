from collections import defaultdict
from typing import Any

from .types import Subscriber


class EventBus:
    __slots__ = ("_map",)

    def __init__(self):
        self._map: defaultdict[str, set[Subscriber]] = defaultdict(set)

    @property
    def subscribers(self):
        return set().union(*self._map.values())

    def subscribe(self, sub: Subscriber, chans: list[str]) -> set[str]:
        """
        map a subscriber to a list of channels.

        Args:
            sub (Subscriber): the sub to add.
            chans (list[str]): list of channels to subscribe.

        Returns:
            set[str]: Newly subscribed channels.
        """
        to_subscribe = set()

        for chan in chans:
            if len(self._map[chan]) == 0:
                to_subscribe.add(chan)
            self._map[chan].add(sub)

        return to_subscribe

    def unsubcribe(self, sub: Subscriber, chans: list[str]) -> set[str]:
        """
        remove a subscriber from a list of channel keys.

        Args:
            sub (Subscriber): the sub to remove.
            chans (list[str]): list of channels to unsubscribe.

        Returns:
            set[str]: Newly unsubscribed channels.
        """
        to_unsubscribe = set()

        for chan in chans:
            self._map[chan].discard(sub)
            if len(self._map[chan]) == 0:
                to_unsubscribe.add(chan)
                del self._map[chan]

        return to_unsubscribe

    def publish_one(self, chan: str, msg: Any):
        """
        dispatch message internally to chan
        """
        for sub in self._map[chan]:
            sub.put_nowait(msg)

    def publish_many(self, chans: list[str], msg: Any):
        """
        dispatch message internally to chans
        """
        for chan in chans:
            self.publish_one(chan, msg)
