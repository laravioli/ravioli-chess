from ipc.channels import Channel
from functools import cached_property


class ChanId(Channel):

    def __init__(self, name):
        self.name = name

    @cached_property
    def chan(self) -> str:
        return f"{self.prefix}:{self.__class__.__qualname__.lower()}:{self.name}"
