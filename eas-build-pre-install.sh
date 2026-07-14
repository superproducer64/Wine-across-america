#!/usr/bin/env bash
set -eo pipefail
sed -i.bak 's#http://package-firewall\.replit\.local/npm/#https://registry.npmjs.org/#g' yarn.lock
rm -f yarn.lock.bak
