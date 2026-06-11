"""
format invariant: chan_name:chan_id
"""

type Chan = str
type ChanName = str
type ChanId = str


class _Chan:
    @staticmethod
    def name(chan: Chan) -> ChanName:
        return chan.split(":")[0]

    @staticmethod
    def id(chan: Chan) -> ChanId:
        return chan.split(":")[1]


# ╔══════════════════════════════════════╗
# ║          Engine Channels             ║
# ╚══════════════════════════════════════╝


class EngChan(_Chan):
    all = ["game:all"]

    @staticmethod
    def game(game_id: str = "all"):
        return f"game:{game_id}"


# ╔══════════════════════════════════════╗
# ║        Websocket Channels            ║
# ╚══════════════════════════════════════╝


class WsChan(_Chan):
    all = ["sri:all", "users:all", "play:all", "room:all"]

    @staticmethod
    def sri(sri_id: ChanId = "all"):
        return f"sri:{sri_id}"

    @staticmethod
    def users(user_id: ChanId = "all"):
        return f"users:{user_id}"

    @staticmethod
    def play(game_id: ChanId = "all"):
        return f"play:{game_id}"

    @staticmethod
    def room(id: ChanId = "all"):
        return f"room:{id}"
