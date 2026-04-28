.DEFAULT_GOAL := all

.PHONY: .docker
.docker:
	@docker -v || (echo 'Please install docker: https://docs.docker.com/engine/install' && exit 1)

.PHONY: .uv
.uv:
	@uv -V || (echo 'Please install uv: https://docs.astral.sh/uv/getting-started/installation/' && exit 1)

.PHONY: install-backend
install-backend: .docker .uv
	cp backend/.env.example backend/.env
	uv sync --frozen --all-groups --all-packages --all-extras
	docker compose -f backend/compose.yaml up -d --build
	uv run --directory backend alembic upgrade head

.PHONY: install-frontend
install-frontend: .docker
	cp client/.env.example client/.env.development
	pnpm install
	./scripts/build-stockfish.sh
	@echo "✅ stockfish build done!"
	$(MAKE) openapi

.PHONY: openapi
openapi: .uv
	uv run --package ravioli-fastapi --directory backend python -m scripts.generate-openapi
	mv backend/openapi.json client/openapi.json
	cd client && pnpm openapi-ts && rm openapi.json

.PHONY: install
install: install-backend install-frontend
	@echo "✅ Install done!"
	@echo "💡 Note: You can now remove the Emscripten Docker image (emscripten/emsdk) to save space."


.PHONY: format 
format: .uv
	uv run ruff check --fix .
	uv run ruff format .
	pnpm --filter client format

.PHONY: dev
dev: .uv
	./scripts/dev.sh || true

.PHONY: all
all: format