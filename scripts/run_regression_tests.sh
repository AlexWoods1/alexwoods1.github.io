#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8010}"
export SITE_URL="${SITE_URL:-http://127.0.0.1:${PORT}}"
export CACHE_BUST="${CACHE_BUST:-24}"

if ! curl -sf "${SITE_URL}/" >/dev/null 2>&1; then
  echo "Starting static server on port ${PORT}..."
  python3 -m http.server "${PORT}" --directory "${ROOT}" &
  PID=$!
  trap 'kill "$PID" 2>/dev/null || true' EXIT
  for _ in $(seq 1 30); do
    curl -sf "${SITE_URL}/" >/dev/null 2>&1 && break
    sleep 0.2
  done
fi

TMP="${TMPDIR:-/tmp}/portfolio-regression-$$"
mkdir -p "${TMP}"
if [[ ! -d "${TMP}/node_modules/playwright" ]]; then
  (cd "${TMP}" && npm init -y >/dev/null 2>&1 && npm install playwright@1.49.0 --silent)
fi
cp "${ROOT}/tests/regression.mjs" "${TMP}/regression.mjs"
(cd "${TMP}" && SITE_URL="${SITE_URL}" CACHE_BUST="${CACHE_BUST}" node regression.mjs)
