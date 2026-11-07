#!/bin/sh
# Installs this theme and builds example/ into example/site. Needs Python.
set -e
cd "$(dirname "$0")"
python -m pip install --quiet --disable-pip-version-check . "mkdocs==${MKDOCS_VERSION:-1.6.1}"
cd example && python -m mkdocs build --strict --quiet --site-dir site
