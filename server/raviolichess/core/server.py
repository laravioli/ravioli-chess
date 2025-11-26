import os
import signal
import asyncio, uvloop

# django settings
from django.conf import settings

from raviolichess.settings import (
    DEBUG,
    CHANNEL_LAYERS,
    RAVIOLI_LAYERS,
    DATABASES,
    LANGUAGE_CODE,
    TIME_ZONE,
    USE_TZ,
    DEFAULT_AUTO_FIELD,
    LOGGING,
)

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "channels",
    "raviolichess.user",
    "raviolichess.game",
]

settings.configure(
    DEBUG=DEBUG,
    INSTALLED_APPS=INSTALLED_APPS,
    CHANNEL_LAYERS=CHANNEL_LAYERS,
    RAVIOLI_LAYERS=RAVIOLI_LAYERS,
    DATABASES=DATABASES,
    LANGUAGE_CODE=LANGUAGE_CODE,
    TIME_ZONE=TIME_ZONE,
    USE_TZ=USE_TZ,
    DEFAULT_AUTO_FIELD=DEFAULT_AUTO_FIELD,
    LOGGING=LOGGING,
)


# django setup
import django

django.setup(set_prefix=False)


# entry point
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
    uvloop.run(main())
