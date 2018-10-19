#!/usr/bin/env bash
cd "$(dirname "$0")"
set -e

for f in ./init.d/*; do source "$f"; cd "$DOCKER_DEVBOX_DIR/init"; done

rm .should-initialize
