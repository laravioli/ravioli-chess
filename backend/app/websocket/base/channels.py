from ravioli_core.ipc.channels import ConsumerChan, UserChan, WebsocketChan

from ..deps import WebsocketParams


def make_channels(
    params: WebsocketParams, chans: list[WebsocketChan] | None = None
) -> list[WebsocketChan]:
    base = [ConsumerChan(params["sri"])]
    if params["user"]:
        base.append(UserChan(params["user"].id))
    return base + chans if chans else base
