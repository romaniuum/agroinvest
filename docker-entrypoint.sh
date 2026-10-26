#!/bin/sh
# Применяет миграции базы и запускает сайт.
set -e

cd /app/migrate
node node_modules/prisma/build/index.js migrate deploy

cd /app
exec node server.js
