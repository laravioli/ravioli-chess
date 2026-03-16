from ..structs import TaggedMsg

# ╔══════════════════════════════════════╗
# ║   APP OUT : websocket <- app         ║
# ╚══════════════════════════════════════╝


class Test(TaggedMsg, tag="test"):
    data: str


type Protocol = Test
