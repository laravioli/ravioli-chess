import asyncio


def register_coro(task_set: set, coro, *args, **kwargs):
    task = asyncio.create_task(coro(*args, **kwargs))
    task_set.add(task)
    task.add_done_callback(task_set.discard)
