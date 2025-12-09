import logging
import asyncio
import random
from functools import wraps
from typing import Callable, Any, Type, Tuple
from .exceptions import TooManyRetryException

RETRYABLE_EXCEPTIONS = (asyncio.TimeoutError, IOError)


def async_retry(
    max_retries: int = 3,
    initial_delay: float = 0.1,
    backoff_factor: float = 2,
    jitter: bool = True,
    retry_exceptions: Tuple[Type[Exception], ...] = RETRYABLE_EXCEPTIONS,
) -> Callable:

    logger = logging.getLogger(__name__)

    def fn_wrapper(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(1, max_retries + 1):
                try:
                    return await fn(*args, **kwargs)

                except retry_exceptions as e:
                    last_exception = e
                    logger.warning(
                        f"attempt {attempt}/{max_retries} failed for '{fn.__name__}': {type(e).__name__}"
                    )

                    if attempt >= max_retries:
                        break
                    calculated_delay = initial_delay * (backoff_factor ** (attempt - 1))
                    if jitter:
                        calculated_delay += random.uniform(0, calculated_delay * 0.1)
                    await asyncio.sleep(calculated_delay)

                except Exception as e:
                    logger.exception(
                        f"non-retryable exception occurred in '{fn.__name__}'"
                    )
                    raise e
            raise TooManyRetryException(
                f"failed to execute '{fn.__name__}' after {max_retries} retries."
            ) from last_exception

        return wrapper

    return fn_wrapper


def register_coro(task_set: set, coro, *args, **kwargs):
    task = asyncio.create_task(coro(*args, **kwargs))
    task_set.add(task)
    task.add_done_callback(task_set.discard)
