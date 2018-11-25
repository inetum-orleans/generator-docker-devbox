#!/usr/bin/env bash

sudo service docker stop
cd "$HOME/.docker-data/"

sudo rm -Rf volumes
sudo rm -Rf containers
sudo tar cpzf .docker-data.tar.gz .
echo "Docker cache archive created ("$HOME/.docker-data/.docker-data.tar.gz")"
echo "Filesize: $(du -sh -0 .docker-data.tar.gz | cut -f -1)"
sudo find . ! -name '.docker-data.tar.gz' -type f -exec rm -f {} +
sudo chown -R travis:travis .
