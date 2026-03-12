from ..schemas import ravioOUT

# ╔══════════════════════════════════════╗
# ║   PROTOCOL IN : client <- ws         ║
# ╚══════════════════════════════════════╝


GameCreate = ravioOUT.GameCreate


type Protocol = GameCreate
