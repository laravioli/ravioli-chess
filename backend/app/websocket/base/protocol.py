from abc import ABC, abstractmethod
from typing import Any

from app.websocket.deps import WebsocketParams
from ravioli_core.ipc.channels import ProcessChan
from ravioli_core.serializers import json


class ConsumerProtocol[T, V](ABC):
    def __init__(self, params: WebsocketParams):
        self.params = params

    @abstractmethod
    async def client_protocol(msg: T) -> None: ...

    @abstractmethod
    async def process_protocol(msg: V) -> None: ...

    @abstractmethod
    async def disconnect(self) -> None: ...

    async def send_json(self, msg: Any) -> None:
        await self.params["websocket"].send(
            {"type": "websocket.send", "text": json.encode_as_str(msg)}
        )

    async def publish(self, chan: ProcessChan, msg: Any) -> None:
        await self.params["broadcast"].publish(chan, msg)
