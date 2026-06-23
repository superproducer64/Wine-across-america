#!/bin/bash
set -eo pipefail

echo "--- Pre-install hook: upgrading npm to latest stable 10.x ---"
npm install -g npm@10
echo "npm version: $(npm --version)"
