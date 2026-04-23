#!/bin/sh
set -e

# マウントされた .git はホスト側 UID 所有なので、コンテナ内（root）から見ると
# git 2.35.2+ の safe.directory チェックで弾かれる。履歴・タイムライン機能が
# 黙って空になるのを防ぐため、起動時に全ディレクトリを信頼対象に追加する
git config --global --add safe.directory '*'

# ユーザー向けの BASE_PATH を Next.js が見る NEXT_PUBLIC_BASE_PATH に変換
if [ -n "${BASE_PATH:-}" ] && [ "${BASE_PATH}" != "/" ]; then
  export NEXT_PUBLIC_BASE_PATH="${BASE_PATH}"
  echo "[markshelf] basePath = ${NEXT_PUBLIC_BASE_PATH}"
else
  unset NEXT_PUBLIC_BASE_PATH
  echo "[markshelf] basePath = (none)"
fi

# 直前のビルドと同じ basePath ならビルドをスキップ（再起動の高速化）
STAMP_FILE=".next/markshelf-basepath"
CURRENT_STAMP="${NEXT_PUBLIC_BASE_PATH:-__none__}"
if [ -f "${STAMP_FILE}" ] && [ "$(cat "${STAMP_FILE}")" = "${CURRENT_STAMP}" ]; then
  echo "[markshelf] reusing existing build for basePath ${CURRENT_STAMP}"
else
  echo "[markshelf] building Next.js application..."
  npx next build
  # standalone の中に静的アセットを取り込む
  # （next build だけでは .next/standalone/.next/static と public は配置されない）
  mkdir -p .next/standalone/.next
  rm -rf .next/standalone/.next/static
  cp -r .next/static .next/standalone/.next/static
  if [ -d public ]; then
    rm -rf .next/standalone/public
    cp -r public .next/standalone/public
  fi
  printf '%s' "${CURRENT_STAMP}" > "${STAMP_FILE}"
fi

echo "[markshelf] starting server on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}"
# standalone の server.js を直接起動。PORT/HOSTNAME は env から読まれる
exec node .next/standalone/server.js
