from fastapi.routing import APIRoute


def custom_generate_unique_id(route: APIRoute):
    return f"{route.name}"
