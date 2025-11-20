import os
import signal
import asyncio

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "game.backend.settings")
import django

django.setup(set_prefix=False)

from .app import start_app, App


async def main():
    shutdown_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def on_signal():
        shutdown_event.set()
        print("Shutting down")

    for sig in [signal.SIGINT, signal.SIGTERM]:
        loop.add_signal_handler(sig, on_signal)

    print(f"Started server process [{os.getpid()}]")
    print("Waiting for application startup.")
    app: App = await start_app()
    print("Application startup complete.")

    await shutdown_event.wait()

    print("Waiting for application shutdown.")
    await app.shutdown()
    print("Application shutdown complete.")
    print(f"Finished server process [{os.getpid()}]")


if __name__ == "__main__":
    asyncio.run(main())
