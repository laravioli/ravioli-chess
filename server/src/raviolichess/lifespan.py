from .layers import async_layer


async def lifespan_app(scope, receive, send):
    while True:
        message = await receive()
        if message["type"] == "lifespan.startup":
            await send({"type": "lifespan.startup.complete"})
        elif message["type"] == "lifespan.shutdown":
            await async_layer.aclose()
            await send({"type": "lifespan.shutdown.complete"})
            return
