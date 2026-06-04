# Marketing (лендінг)

Окремий Vite-додаток. Брендова хмарка (cyan stroke), 3D hero (`CloudLogo3D`), aurora-фон (`HeroAmbient`).

## Локально — тільки лендінг

```bash
cd apps/marketing
npm install
npm run dev
```

Відкрий **http://localhost:3000**

## Лендінг + панель `/app/` (з кореня репо)

```bash
npm install
npm install --prefix apps/marketing
npm run dev
```

| URL | Що |
|-----|-----|
| http://localhost:3000 | Лендінг |
| http://localhost:3000/app/ | Панель (proxy на :5174) |

## Повний стек (+ API)

**Термінал 1** — `traffic-cloud-api`:

```bash
cd ../traffic-cloud-api
cp .env.example .env
# DATABASE_URL, JWT_SECRET
npm install
npm run dev
```

**Термінал 2** — `traffic-cloud-web`:

```bash
npm run dev
```

Опційно в `.env` кореня веб-репо:

```env
VITE_API_BASE_URL=http://127.0.0.1:8787
```

## Збірка

```bash
npm run build
```

Артефакт: `apps/marketing/dist/` (+ `dist/app/` для панелі).
