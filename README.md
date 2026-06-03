# Traffic Cloud Web

Фронтенд: публічний лендінг + веб-панель (без Electron).

## Структура

```
apps/
  marketing/     # Лендінг (Vite + Tailwind v4)
  panel/         # Панель outreach (React + Tailwind v3)
config/
  vite.panel.ts  # Збірка панелі → apps/marketing/dist/app/
scripts/
```

| URL (dev) | Додаток |
|-----------|---------|
| http://localhost:3000 | Лендінг |
| http://localhost:3000/app/ | Панель (проксі → :5174) |

## Локально

```bash
npm install
npm install --prefix apps/marketing
cp .env.example .env

# UI only
npm run dev

# + API (окремий репо traffic-cloud-api)
```

## Збірка

```bash
npm run build
```

Статика: `apps/marketing/dist/` (корінь сайту + `/app/` для панелі).

На хостингу: rewrite `/app/*` → `/app/index.html`.

## API

Backend: [traffic-cloud-api](https://github.com/cartonkaGG/traffic-cloud-api)

Перед `npm run build` задайте `VITE_API_BASE_URL` у `.env`.

## Деплой (Vercel + Render)

Покроково: **[DEPLOY.md](./DEPLOY.md)** — тільки веб, без Electron.
