from websocket.core.app import start_app


async def lifespan_app(scope, receive, send):
    while True:
        message = await receive()
        if message["type"] == "lifespan.startup":
            app = await start_app()
            scope["state"]["app"] = app
            await send({"type": "lifespan.startup.complete"})
        elif message["type"] == "lifespan.shutdown":
            await app.shutdown()
            await send({"type": "lifespan.shutdown.complete"})
            return
