from functools import cache
from typing import TypedDict

from ravioli_core.ipc import p_out


def client_msg_union(extra_types: type):
    return str | extra_types


def process_msg_union(is_auth: bool, extra_types: type):
    base = p_out.TellSocket
    if is_auth:
        base = base | p_out.TellUser
    return base | extra_types


class MessageTypes(TypedDict):
    client: type
    process: type

    @classmethod
    @cache
    def make(cls, is_auth: bool, clientMsg: type, processMsg: type):
        return cls(
            client=client_msg_union(clientMsg), process=process_msg_union(is_auth, processMsg)
        )
