from .redis_client import async_redis_client

async def lifespan_app(scope, receive, send):
    while True:
        message = await receive()
        if message['type'] == 'lifespan.startup':
            await send({'type': 'lifespan.startup.complete'})
        elif message['type'] == 'lifespan.shutdown':
            await async_redis_client.aclose()
            await send({'type': 'lifespan.shutdown.complete'})
            return
