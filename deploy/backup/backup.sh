#!/bin/sh
# Ночной бэкап: дамп базы + архив фото, хранение 14 дней, проверка восстановления.
# Работает в контейнере backup (PG* переменные уже заданы).
set -eu

DIR=/backups
KEEP_DAYS=14
STAMP=$(date +%Y-%m-%d_%H%M)
SCRIPTS=$(dirname "$0")

fail() {
  echo "$(date '+%F %T') ОШИБКА: $1"
  "$SCRIPTS/notify.sh" "Агроинвест: бэкап не удался — $1"
  exit 1
}

echo "$(date '+%F %T') бэкап $STAMP"

pg_dump -Fc -f "$DIR/db-$STAMP.dump.tmp" || fail "дамп базы"
mv "$DIR/db-$STAMP.dump.tmp" "$DIR/db-$STAMP.dump"

tar -czf "$DIR/uploads-$STAMP.tar.gz.tmp" -C /uploads . || fail "архив фото"
mv "$DIR/uploads-$STAMP.tar.gz.tmp" "$DIR/uploads-$STAMP.tar.gz"

# Старше 14 дней — удаляем
find "$DIR" -maxdepth 1 \( -name 'db-*.dump' -o -name 'uploads-*.tar.gz' \) \
  -mtime +$((KEEP_DAYS - 1)) -delete

"$SCRIPTS/restore-check.sh" "$DIR/db-$STAMP.dump" "$DIR/uploads-$STAMP.tar.gz" \
  || fail "проверка восстановления"

echo "$(date '+%F %T') готово: $(du -h "$DIR/db-$STAMP.dump" | cut -f1) база, $(du -h "$DIR/uploads-$STAMP.tar.gz" | cut -f1) фото"
