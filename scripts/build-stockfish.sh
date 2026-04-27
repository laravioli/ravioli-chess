#!/bin/bash
set -euo pipefail

VERSION="sf_18_smallnet_relaxed-simd"
DEST="$(pwd)/client/src/lib/eval/stockfish"
BUILD_DIR="stockfish_build_tmp"

trap 'rm -rf "$BUILD_DIR"' EXIT

[[ -f "$DEST/$VERSION.js" && -f "$DEST/$VERSION.wasm" ]] && exit 0

git clone --depth 1 https://github.com/lichess-org/stockfish-web.git "$BUILD_DIR"

cd "$BUILD_DIR"
./build-with-docker.sh "$VERSION"

mkdir -p "$DEST"
mv "$VERSION.js" "$VERSION.wasm" "$DEST/"

docker image rm emscripten/emsdk:4.0.7 || true