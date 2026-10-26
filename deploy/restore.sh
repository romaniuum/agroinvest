#!/bin/sh
# Восстановление из бэкапа на сервере. ЗАМЕНЯЕТ текущие данные.
# Запуск из /opt/agroinvest: ./restore.sh 2026-10-27_0330
set -eu
cd "$(dirname "$0")"

STAMP=${1:?Укажите дату бэкапа, например 2026-10-27_0330 (см. ls backups)}
DUMP=db-$STAMP.dump
UPLOADS=uploads-$STAMP.tar.gz
[ -f "backups/$DUMP" ] || { echo "Нет файла backups/$DUMP"; exit 1; }

printf 'База и фото будут заменены копией от %s. Продолжить? (да/нет) ' "$STAMP"
read -r answer
[ "$answer" = "да" ] || { echo "Отменено"; exit 1; }

docker compose stop app
# Сайт запускается обратно, даже если восстановление прервалось
trap 'docker compose up -d app' EXIT
docker compose exec -T backup pg_restore --clean --if-exists --no-owner \
  -d "$(grep ^POSTGRES_DB= .env | cut -d= -f2)" "/backups/$DUMP"

if [ -f "backups/$UPLOADS" ]; then
  # Фото кладём через временный контейнер с томом uploads
  docker compose run --rm --no-deps --user root --entrypoint sh \
    -v "${BACKUPS_DIR:-$PWD/backups}:/backups:ro" app \
    -c "rm -rf /data/uploads/* && tar -xzf /backups/$UPLOADS -C /data/uploads && chown -R node:node /data/uploads"
fi

echo "Готово: данные восстановлены из копии $STAMP"
