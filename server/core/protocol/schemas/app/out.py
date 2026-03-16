from ..base import TaggedMsg

# ╔══════════════════════════════════════╗
# ║   APP OUT : ws <- app                ║
# ╚══════════════════════════════════════╝


class Test(TaggedMsg, tag="test"):
    data: str


type Protocol = Test
