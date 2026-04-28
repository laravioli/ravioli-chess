.DEFAULT_GOAL := all

.PHONY: .docker
.docker:
	@docker -v || (echo 'Please install docker: https://docs.docker.com/engine/install' && exit 1)

.PHONY: .uv
.uv:
	@uv -V || (echo 'Please install uv: https://docs.astral.sh/uv/getting-started/installation/' && exit 1)

.PHONY: install-backend
install-backend: .docker .uv
	uv sync --frozen --all-groups --all-packages --all-extras
	docker compose -f backend/compose.yaml build
	cp backend/.env.example backend/.env

.PHONY: install-frontend
install-frontend: .docker
	yarn install
	cp client/.env.example client/.env.development
	./scripts/build-stockfish.sh
	@echo "\n✅ stockfish build done!"
	@echo "💡 Note: You can now remove the Emscripten Docker image (emscripten/emsdk) to save space."
	$(MAKE) openapi

.PHONY: openapi
openapi: .uv
	uv run --package ravioli-fastapi --directory backend python -m scripts.generate-openapi
	mv backend/openapi.json client/openapi.json
	cd client && yarn openapi-ts && rm openapi.json

.PHONY: install
install: install-backend install-frontend
	@echo "\n✅ Install done!"


.PHONY: format 
format: .uv
	uv run ruff check --fix .
	uv run ruff format .
	yarn workspace client run format

.PHONY: dev
dev: .uv
	./scripts/dev.sh || true

.PHONY: all
all: format