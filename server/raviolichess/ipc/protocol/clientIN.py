from ..protocol import ravioOUT
from typing import Union

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : client <- ws         ║
# ╚══════════════════════════════════════╝


GameCreate = ravioOUT.GameCreate


Protocol = Union[GameCreate]
