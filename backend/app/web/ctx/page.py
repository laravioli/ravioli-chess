from msgspec import UNSET, Raw, Struct, UnsetType

from app.web.static_data.chess_positions import positions


class PageConfig(Struct):
    orientation: str | UnsetType = UNSET
    fen: str | UnsetType = UNSET


DEFAULT_CONFIG = PageConfig(
    orientation="white", fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
)


class Metadata(Struct):
    positions: Raw | UnsetType = UNSET


class PageData(Struct):
    config: PageConfig
    data: Metadata | UnsetType = UNSET


class PageCtx:
    def index(self):
        return PageData(config=DEFAULT_CONFIG, data=Metadata(positions=Raw(positions.json)))

    def analyse(self):
        return PageData(config=DEFAULT_CONFIG, data=Metadata(positions=Raw(positions.json)))

    def editor(self):
        return PageData(config=DEFAULT_CONFIG, data=Metadata(positions=Raw(positions.json)))

    def play(self):
        return PageData(config=DEFAULT_CONFIG)

    def profile(self):
        return PageData(config=DEFAULT_CONFIG)
