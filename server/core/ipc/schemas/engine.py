import msgspec


class Msg(msgspec.Struct, tag_field="t"):
    def __contains__(self, key):
        if key == "t":
            return True
        return key in self.__struct_fields__

    def __getitem__(self, key):
        if key == "t":
            return self.__struct_config__.tag
        try:
            return getattr(self, key)
        except AttributeError:
            raise KeyError(key)


# ╔══════════════════════════════════════╗
# ║   ENGINE IN : ws -> engine           ║
# ╚══════════════════════════════════════╝


class EngineIn:
    class GameCreate(Msg, tag="game_create"):
        channel: str
        white_player: str | None = msgspec.field(name="wp", default=None)
        black_player: str | None = msgspec.field(name="bp", default=None)

    class ChallengeAccepted(Msg, tag="challenge_accepted"):
        id: str
        white_player: str | None = msgspec.field(name="wp", default=None)
        black_player: str | None = msgspec.field(name="bp", default=None)

    class GameMove(Msg, tag="game_move"):
        san: str

    class GameResign(Msg, tag="game_resign"):
        player: str

    type GameStart = GameCreate | ChallengeAccepted

    type GameProtocol = GameMove | GameResign

    type Protocol = GameStart | GameProtocol


# ╔══════════════════════════════════════╗
# ║   ENGINE OUT : ws <- engine          ║
# ╚══════════════════════════════════════╝


class EngineOut:
    class GameCreate(Msg, tag="game_create"):
        class Payload(msgspec.Struct):
            game_id: str

        data: Payload

    class GameMove(Msg, tag="game_move"):
        class Payload(msgspec.Struct):
            ok: bool
            san: str

        data: Payload

    class GameEnd(Msg, tag="game_end"):
        class Payload(msgspec.Struct):
            reason: str

        data: Payload

    type GameStart = GameCreate

    type GameProtocol = GameMove | GameEnd

    type Protocol = GameStart | GameProtocol
