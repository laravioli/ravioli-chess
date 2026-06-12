from app.user import Users
from ravioli_core.ipc import ClientIn, p_out
from ravioli_core.ipc.channels import WsChan
from ravioli_core.serializers import json

from .bus import EventBus

# ╔══════════════════════════════════════╗
# ║        Handler                       ║
# ╚══════════════════════════════════════╝


def make_handler(bus: EventBus, users: Users):
    type SriOut = p_out.TellSri | p_out.GameCreate
    type UserOut = p_out.TellUser
    type PlayOut = p_out.GameUpdate

    def handle(channel: str, data: bytes):
        channel_name = channel.split(":")[0]
        match channel_name:
            case "play":
                msg = json.decode(data, type_arg=PlayOut)
                match msg:
                    case p_out.GameUpdate(type, data):
                        bus.publish_one(channel, ClientIn(type, data))
                    case _:
                        raise ValueError("invalid message")
            case "sri":
                msg = json.decode(data, type_arg=SriOut)
                match msg:
                    case p_out.TellSri(type, data):
                        bus.publish_one(channel, ClientIn(type, data))
                    case p_out.GameCreate(data):
                        bus.publish_one(channel, ClientIn(type="gameCreate", data=data))
                    case _:
                        raise ValueError("invalid message")

            case "users":
                msg = json.decode(data, type_arg=UserOut)
                match msg:
                    case p_out.TellUser(type, data):
                        users.tell_one(WsChan.id(channel), ClientIn(type=type, data=data))
                    case _:
                        raise ValueError("invalid message")

            case _:
                raise ValueError("invalid channel")

    return handle
