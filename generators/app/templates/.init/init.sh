#!/usr/bin/env sh
cd "$(dirname "$0")"
set -e

for f in ./init.d/*; do . "$f"; cd "$DOCKER_DEVBOX_DIR/.init"; done

rm .should-initialize
