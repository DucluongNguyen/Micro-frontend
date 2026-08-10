#!/usr/bin/env bash
# Chạy các micro frontend (container + toàn bộ remote) cùng lúc trong 1 terminal.
# Dừng tất cả bằng Ctrl+C.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS=("container" "dashboard" "about" "contact" "info" "setting")

# Mỗi app 1 màu ANSI riêng
COLORS=("35" "36" "33" "32" "34" "31")   # magenta, cyan, yellow, green, blue, red
ESC=$'\033'
RESET="${ESC}[0m"

PIDS=()

cleanup() {
  echo ""
  echo ">> Đang dừng tất cả micro frontend..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Cài dependency trước, tuần tự (không chạy song song với nhau) - tránh log
# npm install của nhiều app chồng chéo nhau và tránh race condition khi
# nhiều tiến trình npm cùng ghi vào cache lần đầu.
for app in "${APPS[@]}"; do
  if [ ! -d "$ROOT_DIR/$app/node_modules" ]; then
    echo ">> [$app] Chưa có node_modules, đang chạy npm install..."
    (cd "$ROOT_DIR/$app" && npm install)
  fi
done

for i in "${!APPS[@]}"; do
  app="${APPS[$i]}"
  color="${ESC}[1;${COLORS[$i]}m"
  (
    cd "$ROOT_DIR/$app"
    npm run start 2>&1 | sed -u -e "s/^/${color}[$app]${RESET} /"
  ) &
  PIDS+=($!)
done

echo ">> Đã khởi động: ${APPS[*]}"
echo ">> Nhấn Ctrl+C để dừng tất cả."

wait
