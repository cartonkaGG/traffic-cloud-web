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

# Тільки UI (лендінг + панель)
npm run dev

# UI + локальний API (окремий репо traffic-cloud-api поруч)
npm run dev:full
```

| URL | Що |
|-----|-----|
| http://localhost:3000 | Лендінг |
| http://localhost:5174/app/ | Панель (dev) |
| http://127.0.0.1:8787 | API (`/health`) |

### Backend окремо

**Варіант A — Docker** (якщо встановлений Docker Desktop):

```bash
cd ../traffic-cloud-api
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run dev
```

**Варіант B — без Docker** (MongoDB Atlas, безкоштовний кластер):

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create cluster → Connect → connection string  
2. У `traffic-cloud-api/.env`:
   ```
   DATABASE_URL=mongodb+srv://USER:PASSWORD@cluster....mongodb.net/trafficcloud
   JWT_SECRET=будь-який-довгий-випадковий-рядок
   ```
3. Atlas → Network Access → додай свою IP (або `0.0.0.0/0` для dev)  
4. `npm run db:push && npm run dev`

**Варіант C — MongoDB Community** на Windows: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), потім `DATABASE_URL=mongodb://127.0.0.1:27017/trafficcloud`.

У `.env` API обов'язково задайте `JWT_SECRET` (наприклад PowerShell: `[Convert]::ToBase64String((1..48|ForEach-Object { Get-Random -Max 256 }))`).

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
