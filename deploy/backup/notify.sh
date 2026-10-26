#!/bin/sh
# Сообщение в Telegram, если бот настроен. Использование: notify.sh "текст без кавычек"
[ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ] || exit 0
text=$(printf '%s' "$1" | sed 's/["\\]/ /g')
wget -q -O /dev/null -T 15 \
  --header 'Content-Type: application/json' \
  --post-data "{\"chat_id\":\"${TELEGRAM_CHAT_ID}\",\"text\":\"${text}\"}" \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" || true
