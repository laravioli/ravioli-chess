from collections.abc import Mapping
from typing import Any

from fastapi.responses import Response
from starlette.background import BackgroundTask

from ravioli_core.serializers import json


class JSONResponse(Response):
    media_type = "application/json"

    def __init__(
        self,
        content: Any,
        status_code: int = 200,
        headers: Mapping[str, str] | None = None,
        media_type: str | None = None,
        background: BackgroundTask | None = None,
    ) -> None:
        super().__init__(content, status_code, headers, media_type, background)

    def render(self, content: Any) -> bytes:
        return json.encode(content)
