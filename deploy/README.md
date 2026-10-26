# Сервер и деплой

На сервере в `/opt/agroinvest` работают четыре контейнера:

| Контейнер | Что делает                                                                         |
| --------- | ---------------------------------------------------------------------------------- |
| `caddy`   | принимает запросы на 80/443, сам получает и продлевает SSL-сертификат              |
| `app`     | сайт и админка; при запуске сам применяет миграции базы                            |
| `db`      | PostgreSQL, наружу не открыт                                                       |
| `backup`  | каждую ночь в 03:30 — бэкап базы и фото, хранение 14 дней, проверка восстановления |

Пуш в `main` → GitHub Actions проверяет код, собирает образ, кладёт его в `ghcr.io/romaniuum/agroinvest` и перезапускает сайт на сервере.

## Первый запуск

1. **Сервер.** Ubuntu 24.04, от 2 ГБ памяти, в российском дата-центре. При создании добавьте свой SSH-ключ.
2. **DNS.** У регистратора домена создайте две записи `A`: `домен` и `www.домен` → IP сервера.
3. **Настройка сервера** (один раз, под root):
   ```bash
   scp deploy/setup-server.sh root@IP:/root/
   ssh root@IP sh /root/setup-server.sh
   ```
   После этого вход только как `deploy@IP` и только по ключу.
4. **Настройки сайта.** Скопируйте `deploy/.env.example` в `/opt/agroinvest/.env` на сервере и заполните. Пароль базы: `openssl rand -hex 24`.
5. **Ключ для деплоя.** На своём компьютере:
   ```bash
   ssh-keygen -t ed25519 -f agroinvest-deploy -N "" -C github-deploy
   ssh-copy-id -i agroinvest-deploy.pub deploy@IP
   ssh-keyscan IP        # вывод — это SSH_KNOWN_HOSTS
   ```
6. **GitHub → Settings → Secrets and variables → Actions.**
   - Secrets: `SSH_HOST` (IP), `SSH_USER` (`deploy`), `SSH_PRIVATE_KEY` (содержимое `agroinvest-deploy`), `SSH_KNOWN_HOSTS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (для мониторинга).
   - Variables: `DOMAIN`, `DEPLOY_ENABLED` = `true`, `SMARTCAPTCHA_CLIENT_KEY` (когда будет).
7. **Деплой.** Пуш в `main` или Actions → CI → Run workflow.
8. **Администратор** — см. раздел ниже.

## Администратор

Создать или сменить пароль (на сервере):

```bash
cd /opt/agroinvest
docker compose exec -it app node create-admin.mjs
```

## Обслуживание

```bash
cd /opt/agroinvest
docker compose ps                 # что запущено
docker compose logs -f app        # логи сайта
ls -lh backups                    # бэкапы
cat backups/backup.log            # журнал бэкапов
docker compose exec backup /backup-scripts/backup.sh   # бэкап прямо сейчас
./restore.sh 2026-10-27_0330      # восстановить из копии (заменит данные!)
```

**Откат на прошлую версию:** в `.env` укажите `APP_IMAGE=ghcr.io/romaniuum/agroinvest:<sha коммита>`, затем `docker compose up -d app`.

**Мониторинг:** workflow «Мониторинг» каждые 10 минут открывает `https://домен/api/health` и пишет в Telegram, если сайт не отвечает.
