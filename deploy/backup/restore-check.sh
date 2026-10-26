#!/bin/sh
# Разворачивает дамп во временную базу и сверяет её с рабочей.
# Использование: restore-check.sh db-XXXX.dump [uploads-XXXX.tar.gz]
set -eu

DUMP=$1
UPLOADS=${2:-}
CHECK_DB=restore_check
# Без служебных сообщений вида «database does not exist, skipping»
export PGOPTIONS="-c client_min_messages=warning"

count() {
  psql -d "$1" -Atc "SELECT count(*) FROM \"$2\""
}

dropdb --if-exists "$CHECK_DB"
createdb "$CHECK_DB"
trap 'dropdb --if-exists "$CHECK_DB"' EXIT

pg_restore --no-owner --exit-on-error -d "$CHECK_DB" "$DUMP"

for table in Lead ServicePrice WorkPhoto AdminUser; do
  restored=$(count "$CHECK_DB" "$table")
  live=$(count "$PGDATABASE" "$table")
  # Между дампом и проверкой могли прийти новые заявки — копия не может быть больше рабочей
  if [ "$restored" -gt "$live" ] || { [ "$table" = ServicePrice ] && [ "$restored" -ne 3 ]; }; then
    echo "таблица $table: в копии $restored, в рабочей базе $live"
    exit 1
  fi
  echo "  $table: $restored"
done

if [ -n "$UPLOADS" ]; then
  files=$(tar -tzf "$UPLOADS" | grep -c '\.webp$' || true)
  photos=$(count "$CHECK_DB" WorkPhoto)
  if [ "$files" -ne $((photos * 2)) ]; then
    echo "фото: в архиве $files файлов, а в базе $photos фото (ожидалось $((photos * 2)))"
    exit 1
  fi
  echo "  фото: $files файлов"
fi

echo "восстановление проверено"
