#!/usr/bin/env bash
set -eo pipefail
echo "=== eas-build-pre-install.sh is running ==="
sed -i.bak 's#http://package-firewall\.replit\.local/npm/#https://registry.npmjs.org/#g' yarn.lock
echo "=== yarn.lock rewrite complete, remaining bad refs: $(grep -c package-firewall.replit.local yarn.lock || echo 0) ==="
rm -f yarn.lock.bak
