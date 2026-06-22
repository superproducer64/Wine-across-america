#!/bin/bash
set -eo pipefail

echo "--- Pre-install hook: upgrading npm to stable 10.8.1 ---"
npm install -g npm@10.8.1
echo "npm version: $(npm --version)"
