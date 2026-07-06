import json
from typing import cast

from app.env import Env
from app.main import app
from app.process.env import Env as ProcessEnv
from app.process.routes import add_routes as add_process_routes
from app.routes import add_routes

env = cast(Env, object())
process_env = cast(ProcessEnv, object())

# create one openapi.json
add_routes(app, env)
add_process_routes(app, process_env)


def generate_schema():
    schema = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(schema, f, indent=2)


if __name__ == "__main__":
    generate_schema()
