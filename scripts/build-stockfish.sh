#!/bin/bash
set -euo pipefail

VERSION="sf_18_smallnet_relaxed-simd"
ROOT_DIR="$(pwd)"
DEST="$ROOT_DIR/client/src/lib/eval/stockfish"
BUILD_DIR="$ROOT_DIR/sf_tmp"

cleanup() {
    rm -rf "$BUILD_DIR"
}
trap cleanup EXIT

[[ -f "$DEST/$VERSION.js" && -f "$DEST/$VERSION.wasm" ]] && exit 0

git clone --depth 1 https://github.com/lichess-org/stockfish-web.git "$BUILD_DIR"

cd "$BUILD_DIR"
./build-with-docker.sh "$VERSION"

mkdir -p "$DEST"
mv "$VERSION.js" "$VERSION.wasm" "$DEST/"