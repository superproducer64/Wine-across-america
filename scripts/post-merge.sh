#!/bin/bash
set -e

# Use yarn if yarn.lock exists (avoids npm package-firewall blocks)
if [ -f "yarn.lock" ]; then
  yarn install --non-interactive --ignore-engines 2>&1
else
  npm install --legacy-peer-deps 2>&1
fi
