import msgspec
from typing import Optional
from ..protocol import ravioOUT

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : client <- ws         ║
# ╚══════════════════════════════════════╝


GameCreate = ravioOUT.GameCreate
