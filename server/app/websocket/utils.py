import uuid


def new_channel():
    return f"ws_{uuid.uuid4()}"
