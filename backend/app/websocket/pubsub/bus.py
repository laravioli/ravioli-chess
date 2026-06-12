from collections import defaultdict
from collections.abc import Iterable
from typing import Any

from ravioli_core.pubsub.types import Chan, Subscriber


class EventBus:
    __slots__ = ("_mapping", "_subs")

    def __init__(self):
        self._mapping: defaultdict[Chan, set[Subscriber]] = defaultdict(set)
        self._subs: set[Subscriber] = set()

    @property
    def subs(self):
        return self._subs

    def register(self, sub: Subscriber):
        self._subs.add(sub)

    def unregister(self, sub: Subscriber):
        self._subs.discard(sub)

    def subscribe(self, sub: Subscriber, chans: Iterable[Chan]):
        """
        map a subscriber to a list of channels.

        Args:
            sub (Subscriber): a sub to add.
            chans (list[str]): list of channels to subscribe.

        Returns:
            set[str]: Newly subscribed channels.
        """
        to_subscribe = set()

        for chan in chans:
            if len(self._mapping[chan]) == 0:
                to_subscribe.add(chan)
            self._mapping[chan].add(sub)

        return to_subscribe

    def unsubscribe(self, sub: Subscriber, chans: Iterable[Chan]):
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
            self._mapping[chan].discard(sub)
            if len(self._mapping[chan]) == 0:
                to_unsubscribe.add(chan)
                del self._mapping[chan]

        return to_unsubscribe

    def publish_one(self, chan: Chan, msg: Any):
        """
        dispatch message internally to chan
        """
        try:
            for sub in self._mapping[chan]:
                sub.put_nowait(msg)
        except KeyError:
            pass

    def publish_many(self, chans: Iterable[Chan], msg: Any):
        """
        dispatch message internally to chans
        """
        for chan in chans:
            self.publish_one(chan, msg)
