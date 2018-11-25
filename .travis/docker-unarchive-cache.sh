#!/usr/bin/env bash

CACHE_ARCHIVE="$HOME/.docker-data/.docker-data.tar.gz"

if [ -f "$CACHE_ARCHIVE" ]; then
  echo "Docker cache archive found ($CACHE_ARCHIVE)"
  echo "Filesize: $(du -sh -0 "$CACHE_ARCHIVE" | cut -f -1)"
  sudo tar zxf "$CACHE_ARCHIVE" -C "$HOME/.docker-data"
else
  echo "Docker cache archive not found ($CACHE_ARCHIVE)"
fi

sudo mkdir -p ~/.docker-data
sudo chown root:root ~/.docker-data
