from ravioli_core.ipc import ClientIn, p_out
from ravioli_core.pubsub import EventBus
from ravioli_core.pubsub.topic import Deps, Topic

type SiteOut = p_out.TellUser | p_out.TellSocket | p_out.GameCreate
type PlayOut = p_out.GameUpdate | p_out.GameUpdate


def site_handler(bus: EventBus, chan: str, msg: SiteOut):
    match msg:
        case p_out.TellSocket(type, data) | p_out.TellUser(type, data):
            bus.publish_one(chan, ClientIn(type=type, data=data))

        case p_out.GameCreate(data):
            bus.publish_one(chan, ClientIn(type="gameCreate", data=data))


def play_handler(bus: EventBus, chan: str, msg: PlayOut):
    match msg:
        case p_out.GameUpdate(type, data):
            bus.publish_one(chan, ClientIn(type, data))


def make_topics(bus: EventBus):
    site = Topic(
        name="site",
        deps=Deps(
            bus=bus,
            handler=site_handler,
            message_types=SiteOut,
        ),
    )
    play = Topic(
        name="play",
        deps=Deps(
            bus=bus,
            handler=play_handler,
            message_types=PlayOut,
        ),
    )
    return {"site": site, "play": play}
