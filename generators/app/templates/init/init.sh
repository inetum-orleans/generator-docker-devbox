#!/usr/bin/env bash
cd "$(dirname "$0")"
set -e

BASH_ENTER_ALIAS_ONLY=1

shopt -s expand_aliases
alias autostash=
source ../.bash_enter

for f in ./init.d/*; do source "$f"; done

touch .initialized
