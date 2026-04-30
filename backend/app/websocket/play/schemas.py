from dataclasses import dataclass

from ravioli_core.ipc.channels import EngineGameChan


@dataclass
class Game:
    id: str
    chan: EngineGameChan
