from app.websocket.frame import ClientIn
from ravioli_core.ipc import w_in
from ravioli_core.ipc.channels import WsChan
from ravioli_core.pubsub.utils import str_if_bytes
from ravioli_core.serializers import json

from .bus import EventBus
from .users import Users

# ╔══════════════════════════════════════╗
# ║        Handler                       ║
# ╚══════════════════════════════════════╝

type SriIn = w_in.TellSriRaw
type UserIn = w_in.TellUserRaw
type PlayIn = w_in.GameUpdateRaw


def make_handler(bus: EventBus, users: Users):

    def handle(channel: str | bytes, data: bytes):
        channel = str_if_bytes(channel)
        channel_name = channel.split(":")[0]
        match channel_name:
            case "play":
                msg = json.decode(data, type_arg=PlayIn)
                match msg:
                    case w_in.GameUpdateRaw(type, data):
                        bus.publish_one(channel, ClientIn(type, data))
                    case _:
                        raise ValueError("invalid message")
            case "sri":
                msg = json.decode(data, type_arg=SriIn)
                match msg:
                    case w_in.TellSriRaw(type, data):
                        bus.publish_one(channel, ClientIn(type, data))
                    case _:
                        raise ValueError("invalid message")

            case "users":
                msg = json.decode(data, type_arg=UserIn)
                match msg:
                    case w_in.TellUserRaw(type, data):
                        users.tell_one(WsChan.id(channel), ClientIn(type=type, data=data))
                    case _:
                        raise ValueError("invalid message")

            case _:
                raise ValueError("invalid channel")

    return handle
