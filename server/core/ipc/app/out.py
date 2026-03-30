from ..structs import TaggedMsg

# ╔══════════════════════════════════════╗
# ║   APP OUT : websocket <- app         ║
# ╚══════════════════════════════════════╝


class TestMsg(TaggedMsg, tag="test"):
    data: str


type Protocol = TestMsg
