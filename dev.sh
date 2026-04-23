#!/usr/bin/env bash
set -e

docker compose -f server/compose.yaml up -d
uv run honcho start