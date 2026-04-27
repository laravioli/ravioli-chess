#!/usr/bin/env bash
set -e

docker compose -f backend/compose.yaml up -d
uv run honcho start