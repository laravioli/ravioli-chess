#!/bin/bash

set -e

VERSION="sf_18_smallnet"
DEST="./client/src/lib/eval/stockfish"

if [[ -f "$DEST/$VERSION.js" && -f "$DEST/$VERSION.wasm" ]]; then
  echo "Files $VERSION.js and $VERSION.wasm already exist in $DEST. Skipping build."
  rm -rf stockfish-web
  exit 0
fi

git clone https://github.com/lichess-org/stockfish-web.git

cd ./stockfish-web/ && ./build-with-docker.sh "$VERSION"
echo "Build complete"

echo "Move output to $DEST"
cd ..
mkdir -p $DEST
mv "./stockfish-web/$VERSION.js" "./stockfish-web/$VERSION.wasm" $DEST

rm -rf stockfish-web
docker image rm emscripten/emsdk:4.0.7
