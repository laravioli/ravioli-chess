from fastapi import Response


async def api_response_headers(response: Response):
    response.headers["cache-control"] = "max-age=0, must-revalidate, private"
