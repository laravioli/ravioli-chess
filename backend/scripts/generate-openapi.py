import json

from app.main import app
from app.matchmaking.views import router as router_matchmaking

# create one openapi.json
app.include_router(router_matchmaking)


def generate_schema():
    schema = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(schema, f, indent=2)


if __name__ == "__main__":
    generate_schema()
