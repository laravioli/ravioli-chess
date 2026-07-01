backend: PYTHONUNBUFFERED=true uv run --package ravioli-fastapi --directory backend uvicorn app.main:app --reload --use-colors
matchmaking: PYTHONUNBUFFERED=true uv run --package ravioli-fastapi --directory backend uvicorn app.coordinator.main:app --port 8001 --reload --use-colors
frontend: FORCE_COLOR=1 pnpm -C client dev --clearScreen false