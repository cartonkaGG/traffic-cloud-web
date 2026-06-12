# Деплой: Vercel (сайт) + Render (API)

Тільки веб. Desktop / Electron не потрібні.

## Архітектура

```
Користувач → https://твій-проект.vercel.app     (лендінг + /app/ панель)
                    ↓ HTTPS + WSS
             https://traffic-cloud-api.onrender.com   (REST + WebSocket)
                    ↓
             MongoDB Atlas
```

---

## 1. Render — backend (`traffic-cloud-api`)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Підключи репозиторій **cartonkaGG/traffic-cloud-api** (гілка `main`)
3. Налаштування:
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
4. **Environment Variables** (обов’язково):

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Рядок MongoDB Atlas (`mongodb+srv://...`) |
   | `JWT_SECRET` | Згенерований секрет (PowerShell, див. README API) |
   | `PANEL_BASE_URL` | `https://твій-проект.vercel.app/app` (посилання в листах підтвердження) |
   | `RESEND_API_KEY` | Ключ з [resend.com](https://resend.com/api-keys) — **обовʼязково на Render** |
   | `MAIL_FROM` | `Traffic Cloud <onboarding@resend.dev>` (або ваш домен після верифікації в Resend) |

   **Чому не Gmail SMTP:** Render блокує вихідні порти 587/465. Gmail SMTP працює лише локально.

   Опційно локально: `SMTP_USER` + `SMTP_PASS` (Gmail App Password).

5. **Deploy** → скопіюй URL сервісу, напр. `https://traffic-cloud-api.onrender.com`

### MongoDB Atlas

- Cluster → **Network Access** → дозволь `0.0.0.0/0` (або IP Render, якщо знаєш)
- **Database** → Connect → рядок у `DATABASE_URL`
- Один раз локально або у Shell Render: `npx prisma db push` (схема з `prisma/`)

### Перевірка API

Відкрий у браузері: `https://ТВІЙ-API.onrender.com/health` → має бути OK і `"mail":{"configured":true,...}`.

Якщо `mail.configured` = `false` — додай `RESEND_API_KEY` на Render і **Manual Deploy**.  
Якщо `mail.transport` = `smtp` на Render — листи не підуть; потрібен `resend`.

---

## 2. Vercel — frontend (`traffic-cloud-web`)

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Імпорт **cartonkaGG/traffic-cloud-web**
3. Vercel підхопить `vercel.json` автоматично:
   - **Output:** `apps/marketing/dist`
   - **Build:** `npm run build`
4. **Environment Variables** (для Production і Preview):

   | Key | Value |
   |-----|--------|
   | `VITE_API_BASE_URL` | URL Render API **без** слеша в кінці, напр. `https://traffic-cloud-api.onrender.com` |
   | `VITE_DESKTOP_DOWNLOAD_URL` | (опційно) Пряме посилання на `.exe`, поки API manifest `configured: false` |

5. **Deploy**

### Десктоп-інсталятор (TikTok Warmup)

На **Render** (`traffic-cloud-api`) додай:

| Key | Value |
|-----|--------|
| `DESKTOP_SETUP_DOWNLOAD_URL` | URL на `.exe` (можна `{version}` у рядку) |
| `DESKTOP_LATEST_VERSION` | (опційно) версія, напр. `0.2.1` |

Перевірка: `GET https://ТВІЙ-API.onrender.com/v1/desktop/update-manifest` → `configured: true` і `downloadUrl`.

Альтернатива: лише `VITE_DESKTOP_DOWNLOAD_URL` на Vercel (вшивається при build).

### Перевірка сайту

| URL | Що |
|-----|-----|
| `https://твій.vercel.app/` | Лендінг |
| `https://твій.vercel.app/app/` | Панель (логін / реєстрація) |

Кнопка **Увійти** на лендінгу веде на `/app/`.

---

## 3. Після деплою

1. Зареєструйся на `/app/auth`
2. У **Налаштування** додай Telegram API ID / Hash (з [my.telegram.org](https://my.telegram.org/apps))
3. Підключи Telegram-акаунти, проксі (SOCKS5 для MTProto), кампанії

Anti-detect **браузер** у вебі не запускається — розсилка йде через **серверний MTProto**.

---

## 4. Оновлення

- Push у `traffic-cloud-api` → Render redeploy
- Push у `traffic-cloud-web` → Vercel redeploy  
  Якщо змінився URL API — онови `VITE_API_BASE_URL` на Vercel і **Redeploy** (змінна вшивається при build).

---

## 5. Типові проблеми

| Симптом | Рішення |
|---------|---------|
| Панель «Нет подключения к API» | Перевір `VITE_API_BASE_URL` і redeploy Vercel |
| 503 / database | `DATABASE_URL`, Atlas Network Access |
| 401 після redeploy API | Змінився `JWT_SECRET` — увійди знову |
| `/app/` білий екран | Перевір, що в dist є `app/index.html` (build локально `npm run build`) |
| Render «спить» (free) | Перший запит 30–60 с — це нормально для free tier |
| Реєстрація OK, листів немає | Додай `RESEND_API_KEY` на Render (Gmail SMTP там не працює) |
| ENETUNREACH / Connection timeout | Render блокує SMTP :587/:465 → використовуй Resend API |
| iCloud не отримує лист | Перевір папку **Спам**; `MAIL_FROM=Traffic Cloud <onboarding@resend.dev>` |
