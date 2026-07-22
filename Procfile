backend: PYTHONUNBUFFERED=true uv run --package ravioli-fastapi --directory backend uvicorn app.main:app --reload --reload-include *.sql
backend-solo: PYTHONUNBUFFERED=true uv run --package ravioli-fastapi --directory backend uvicorn app.process.main:app --port 8001 --reload
frontend: FORCE_COLOR=1 pnpm -C client dev --clearScreen false