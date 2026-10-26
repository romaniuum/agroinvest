# Образ сайта: Next.js standalone + Prisma CLI для миграций при запуске.

FROM node:24-alpine AS base
RUN apk add --no-cache openssl

# ——— Зависимости ———
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# postinstall запускает prisma generate — для него нужна схема
RUN npm ci

# ——— Сборка ———
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ключ капчи для браузера вшивается в сборку
ARG NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=""
ENV NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY=$NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
ENV NEXT_TELEMETRY_DISABLED=1
# Клиент Prisma (src/generated) в образ не копируется — генерируем здесь
RUN mkdir -p public \
  && npx prisma generate \
  && npm run build \
  && npm run build:create-admin

# ——— Только Prisma CLI для migrate deploy ———
FROM base AS migrator
WORKDIR /migrate
RUN npm init -y >/dev/null \
  && npm install --no-audit --no-fund prisma@7.10.1 dotenv@18.0.9

# ——— Запуск ———
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/data/uploads

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# npm run create-admin для сервера: docker compose exec -it app node create-admin.mjs
COPY --from=build /app/dist/create-admin.mjs ./create-admin.mjs
COPY --from=migrator /migrate/node_modules ./migrate/node_modules
COPY prisma.config.ts ./migrate/
COPY prisma ./migrate/prisma
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/

RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
ENTRYPOINT ["docker-entrypoint.sh"]
