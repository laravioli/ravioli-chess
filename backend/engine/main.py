import asyncio
import logging
import os
import signal

import uvloop

from ravioli_core.config import LogSettings, configure_logging

from .app import App

configure_logging(settings=LogSettings())
logger = logging.getLogger(__name__)


async def main():
    shutdown_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def on_signal():
        shutdown_event.set()
        logger.info("Shutting down")

    for sig in [signal.SIGINT, signal.SIGTERM]:
        loop.add_signal_handler(sig, on_signal)

    logger.info(f"Started server process [{os.getpid()}]")
    logger.info("Waiting for application startup.")

    async with App():
        logger.info("Application startup complete.")
        await shutdown_event.wait()
        logger.info("Waiting for application shutdown.")

    logger.info("Application shutdown complete.")
    logger.info(f"Finished server process [{os.getpid()}]")


if __name__ == "__main__":
    uvloop.run(main())
