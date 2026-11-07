#!/bin/sh
# Builds exampleSite/ with this theme into exampleSite/public. Needs Hugo
# (extended not required), or run it in Docker:
#   docker run --rm -v "$PWD/..":/themes -w /themes/hugo --entrypoint sh ghcr.io/gohugoio/hugo:latest build-example.sh
set -e
cd "$(dirname "$0")"
hugo --quiet --source exampleSite --themesDir ../.. --theme hugo --destination public --cleanDestinationDir
