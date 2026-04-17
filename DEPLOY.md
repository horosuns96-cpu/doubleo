# Деплой на Vercel + налаштування Telegram-бота

## 1. Env variables на Vercel

У `Vercel Dashboard → твій проєкт → Settings → Environment Variables` додай:

| Name | Value | Environments |
|---|---|---|
| `TG_BOT_TOKEN` | `8557134959:AAHMd0aYKQLlAuEgWPsFU_JkjbMTsTfzAsM` | Production, Preview, Development |
| `TG_CHAT_ID` | `-1003923061515` | Production, Preview, Development |

**Важливо**: після додавання чи зміни env vars — треба зробити redeploy (Dashboard → Deployments → ••• → Redeploy).

## 2. Додай бота в групу з правами

1. Зайди у свою групу Telegram
2. Відкрий інформацію про групу → Адміністратори → Додати адміна
3. Знайди свого бота за username → встанови права: "Надсилати повідомлення" (достатньо)

Без адмінства бот **не зможе писати** у супергрупах/каналах.

## 3. Тест API локально (опційно)

Локально Vercel-функції не запустяться без `vercel dev`. Можеш:

```bash
npm i -g vercel
vercel login
vercel dev
```

→ відкриється `http://localhost:3000` з працюючим `/api/checkout`.

**Або** просто деплой — Vercel швидкий, тестувати можна на preview-URL.

## 4. Формат замовлення у Telegram

```
🛒 НОВЕ ЗАМОВЛЕННЯ · DOUBLEO HoReCa

Товари:
1. Prima Italiano — Oro 80/20 — 5 × 250 г · уп
    └ Професійна кава-бленд 80% арабіка / 20% робуста
2. Maribell · Карамель — 3 × 0.7 л · пляшка
    └ Класичний карамельний сироп для латте та десертів

Позицій: 2 · Одиниць: 8

Контакти:
👤 Іван Петренко
📞 +380 93 968 68 54
💬 Доставка на четвер

Сторінка: /catalog.html
IP: 77.47.12.34 · Mozilla/5.0 ...
```

## 5. Безпека

- ✅ Токен бота **НЕ** у фронтенді — тільки у env vars на Vercel
- ✅ Rate limit: 6 запитів/хв з одного IP (429 після ліміту)
- ✅ Honeypot-поле `website` — боти заповнюють, відфільтровуються
- ✅ Валідація всіх полів на сервері (name ≥2, phone формат +380, items ≤60)
- ✅ HTML-escape у тексті повідомлення

## 6. Діагностика проблем

**Замовлення не приходять:**
1. Перевір env vars у Vercel — правильно прописані?
2. Vercel Dashboard → Deployments → останній → Functions → `/api/checkout` → Logs. Шукай:
   - `Missing TG_BOT_TOKEN` → env не підхопились, зроби Redeploy
   - `Telegram error: Bad Request: chat not found` → невірний `TG_CHAT_ID`
   - `Telegram error: Forbidden: bot is not a member` → додай бота в групу
   - `Telegram error: Bad Request: have no rights to send a message` → зроби бота адміном
3. У DevTools браузера → Network → POST `/api/checkout` → подивись відповідь

**Fallback працює:**
Якщо API падає, юзер бачить повідомлення з прямим посиланням `t.me/sfrn_app?text=...` — він може натиснути і відправити руками.

## 7. Перегенерація токена (рекомендовано)

Поточний токен був надісланий у чаті Cascade. Якщо піде в прод — раджу:
1. `@BotFather` → `/revoke` → вибери бота → отримай новий токен
2. Онови `TG_BOT_TOKEN` у Vercel → Redeploy

## 8. Майбутні покращення (при потребі)

- **Email-дублікат**: додати `RESEND_API_KEY` env var + виклик Resend у `api/checkout.js`
- **Google Sheets лог**: webhook у Google Apps Script, паралельно до Telegram
- **База**: Vercel KV / Supabase для історії замовлень + адмінка
- **SMS підтвердження** клієнту: Turbo SMS / SMSClub API
