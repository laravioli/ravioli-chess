from collections.abc import Callable


class EventBus:
    __slots__ = ("_map", "publish")

    def __init__(self, publish: Callable[[str, str], None]):
        _map: dict[str, set] = {}
