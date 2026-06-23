#!/usr/bin/env bash
# Pre-install hook: upgrade npm via direct tarball download
# Avoids the chicken-and-egg problem where npm@buggy crashes upgrading itself

NPM_VER="10.9.2"
TMP_DIR=$(mktemp -d)

echo "--- EAS pre-install hook: upgrading npm@${NPM_VER} via curl ---"

# Download npm tarball directly — never invoke npm to upgrade npm
curl -fsSL "https://registry.npmjs.org/npm/-/npm-${NPM_VER}.tgz" \
  -o "${TMP_DIR}/npm.tgz" || {
  echo "WARNING: curl download failed, proceeding with system npm"
  exit 0
}

tar -xzf "${TMP_DIR}/npm.tgz" -C "${TMP_DIR}" || {
  echo "WARNING: tar extraction failed, proceeding with system npm"
  exit 0
}

# Locate the npm global lib directory without invoking npm install
NPM_GLOBAL=$(npm prefix -g 2>/dev/null || node -e "
  const path = require('path');
  const exe = process.execPath; // /path/to/bin/node
  console.log(path.resolve(exe, '..', '..'));
" 2>/dev/null || echo "")

NPM_LIB=""
if [ -n "${NPM_GLOBAL}" ] && [ -d "${NPM_GLOBAL}/lib/node_modules/npm" ]; then
  NPM_LIB="${NPM_GLOBAL}/lib/node_modules/npm"
else
  # Fallback: resolve from the npm symlink in PATH
  NPM_BIN=$(which npm 2>/dev/null || echo "")
  if [ -n "${NPM_BIN}" ]; then
    NPM_REAL=$(readlink -f "${NPM_BIN}" 2>/dev/null || echo "${NPM_BIN}")
    # real binary lives at PREFIX/lib/node_modules/npm/bin/npm-cli.js
    CANDIDATE=$(dirname "${NPM_REAL}")     # .../npm/bin
    CANDIDATE=$(dirname "${CANDIDATE}")    # .../npm
    [ -f "${CANDIDATE}/package.json" ] && NPM_LIB="${CANDIDATE}"
  fi
fi

if [ -n "${NPM_LIB}" ]; then
  echo "Replacing npm at: ${NPM_LIB}"
  cp -rf "${TMP_DIR}/package/." "${NPM_LIB}/"
  echo "npm version after upgrade: $(npm --version)"
else
  echo "WARNING: could not locate npm lib dir, skipping upgrade"
fi

rm -rf "${TMP_DIR}"
exit 0
