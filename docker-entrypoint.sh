#!/bin/sh
set -e

# Translate user-facing BASE_PATH env into Next.js-recognized NEXT_PUBLIC_BASE_PATH
if [ -n "${BASE_PATH:-}" ] && [ "${BASE_PATH}" != "/" ]; then
  export NEXT_PUBLIC_BASE_PATH="${BASE_PATH}"
  echo "[markshelf] basePath = ${NEXT_PUBLIC_BASE_PATH}"
else
  unset NEXT_PUBLIC_BASE_PATH
  echo "[markshelf] basePath = (none)"
fi

# Skip rebuild if a previous build already used the same basePath (faster restart)
STAMP_FILE=".next/markshelf-basepath"
CURRENT_STAMP="${NEXT_PUBLIC_BASE_PATH:-__none__}"
if [ -f "${STAMP_FILE}" ] && [ "$(cat "${STAMP_FILE}")" = "${CURRENT_STAMP}" ]; then
  echo "[markshelf] reusing existing build for basePath ${CURRENT_STAMP}"
else
  echo "[markshelf] building Next.js application..."
  npx next build
  mkdir -p .next
  printf '%s' "${CURRENT_STAMP}" > "${STAMP_FILE}"
fi

echo "[markshelf] starting server on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}"
exec npx next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
