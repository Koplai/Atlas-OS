#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/root/.openclaw/credentials/telegram-atlaslogs.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

source "$ENV_FILE"

if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 '<message>'" >&2
  exit 1
fi

TEXT="$1"

curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id="${TELEGRAM_CHAT_ID}" \
  --data-urlencode text="$TEXT" >/dev/null

echo "OK"
