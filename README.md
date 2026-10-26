# Агроинвест

Сайт компании «Агроинвест» (ремонт газовых котлов, монтаж отопления, обслуживание котельных) и простая админка для сотрудников.

Подробное описание проекта, дизайна и этапов — в [CLAUDE.md](CLAUDE.md).

## Что нужно установить

- Node.js 20.9 или новее (проверено на 24)
- npm

## Запуск на своём компьютере

```bash
npm install
cp .env.example .env
npm run dev
```

Сайт откроется по адресу http://localhost:3000.

## Команды

| Команда                | Что делает                         |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | запуск в режиме разработки         |
| `npm run build`        | сборка для сервера                 |
| `npm run start`        | запуск собранной версии            |
| `npm run lint`         | проверка кода (ESLint)             |
| `npm run typecheck`    | проверка типов TypeScript          |
| `npm run format`       | автоформатирование (Prettier)      |
| `npm run format:check` | проверка форматирования без правок |

## Стек

Next.js (App Router), TypeScript, ESLint, Prettier. Дальше по этапам: PostgreSQL + Prisma, Docker Compose, Caddy.
