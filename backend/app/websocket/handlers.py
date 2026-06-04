from collections.abc import Callable
from typing import TypedDict

from ravioli_core.ipc import ClientIn, p_out
from ravioli_core.pubsub import EventBus
from ravioli_core.pubsub.topic import Deps, Topic

from .users import Users

type SiteOut = p_out.TellUser | p_out.TellSocket | p_out.GameCreate
type PlayOut = p_out.GameUpdate | p_out.GameUpdate


class Handlers(TypedDict):
    site: Callable[[str, SiteOut], None]
    play: Callable[[str, PlayOut], None]


def make_handlers(bus: EventBus) -> Handlers:

    def site_handler(chan: str, msg: SiteOut):
        match msg:
            case p_out.TellSocket(type, data) | p_out.TellUser(type, data):
                bus.publish_one(chan, ClientIn(type=type, data=data))

            case p_out.GameCreate(data):
                bus.publish_one(chan, ClientIn(type="gameCreate", data=data))

    def play_handler(chan: str, msg: PlayOut):
        match msg:
            case p_out.GameUpdate(type, data):
                bus.publish_one(chan, ClientIn(type, data))

    return {"site": site_handler, "play": play_handler}


def make_topics(bus: EventBus):
    handlers = make_handlers(bus)
    site = Topic(
        name="site",
        deps=Deps(
            bus=bus,
            handler=handlers["site"],
            message_types=SiteOut,
        ),
    )
    play = Topic(
        name="play",
        deps=Deps(
            bus=bus,
            handler=handlers["play"],
            message_types=PlayOut,
        ),
    )
    return {"site": site, "play": play}
