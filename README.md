# Агроинвест

Сайт компании «Агроинвест» (ремонт газовых котлов, монтаж отопления, обслуживание котельных) и простая админка для сотрудников.

Подробное описание проекта, дизайна и этапов — в [CLAUDE.md](CLAUDE.md).

## Что нужно установить

- Node.js 24 или новее
- npm

## Запуск на своём компьютере

Нужен Docker (для базы PostgreSQL).

```bash
npm install
cp .env.example .env   # и впишите пароль базы в POSTGRES_PASSWORD и DATABASE_URL
npm run db:up          # запустить PostgreSQL в Docker
npm run db:migrate     # создать таблицы
npm run create-admin   # создать логин и пароль для админки
npm run dev
```

Сайт откроется по адресу http://localhost:3000, админка — http://localhost:3000/admin.

Пока в `.env` не заполнены Telegram, почта и ключи капчи, заявки только сохраняются в базу, а в лог пишется, что уведомление не настроено.

## Команды

| Команда                | Что делает                                |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | запуск в режиме разработки                |
| `npm run build`        | сборка для сервера                        |
| `npm run start`        | запуск собранной версии                   |
| `npm run lint`         | проверка кода (ESLint)                    |
| `npm run typecheck`    | проверка типов TypeScript                 |
| `npm run format`       | автоформатирование (Prettier)             |
| `npm run format:check` | проверка форматирования без правок        |
| `npm test`             | тесты (Vitest)                            |
| `npm run db:up`        | запустить базу в Docker                   |
| `npm run db:migrate`   | применить и создать миграции              |
| `npm run db:deploy`    | применить миграции на сервере             |
| `npm run create-admin` | создать администратора или сменить пароль |

## Стек

Next.js (App Router), TypeScript, CSS Modules, PostgreSQL + Prisma 7, zod, nodemailer, Vitest, ESLint, Prettier. На сервере — Docker Compose и Caddy.

## Сервер и деплой

Всё про сервер, первый запуск, бэкапы и восстановление — в [deploy/README.md](deploy/README.md).

Собрать и запустить образ локально:

```bash
docker build -t agroinvest:local .
```
