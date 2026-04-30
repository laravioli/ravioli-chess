.DEFAULT_GOAL := all
.PHONY: .docker .uv install-backend install-frontend install openapi register-redis format dev all

.docker:
	@docker -v > /dev/null 2>&1 || (echo 'Please install docker: https://docs.docker.com/engine/install' && exit 1)

.uv:
	@uv -V > /dev/null 2>&1 || (echo 'Please install uv: https://docs.astral.sh/uv/getting-started/installation/' && exit 1)

install-backend: .docker .uv
	@test -f backend/.env || cp backend/.env.example backend/.env
	uv sync --frozen --all-groups --all-packages --all-extras
	docker compose -f backend/compose.yaml up -d --build
	uv run --directory backend alembic upgrade head
	$(MAKE) register-redis

install-frontend: .docker
	@test -f client/.env.development || cp client/.env.example client/.env.development	
	pnpm install
	./scripts/build-stockfish.sh
	@echo "✅ stockfish build done!"
	$(MAKE) openapi

install: install-backend install-frontend
	@echo "✅ Install done!"
	@echo "💡 Note: You can now remove the Emscripten Docker image (emscripten/emsdk) to save space."

openapi: .uv
	uv run --package ravioli-fastapi --directory backend python3 -m scripts.generate-openapi
	mv backend/openapi.json client/openapi.json
	pnpm --dir client openapi-ts
	@rm -f client/openapi.json

register-redis: .uv
	@uv run --directory backend python3 -m scripts.register-redis-functions

format: .uv
	uv run ruff check --fix .
	uv run ruff format .
	pnpm --filter client format

dev: .uv
	./scripts/dev.sh || true

all: format