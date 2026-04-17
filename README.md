# DOUBLEO HoReCa — лендінг

Статичний односторінковий сайт для постачальника товарів для кав'ярень (м. Дніпро).

## Стек
- Чистий HTML/CSS/JS, без збірки
- Шрифти Google Fonts (Manrope + Montserrat)
- Плавні анімації на CSS + IntersectionObserver

## Запуск локально
```bash
python3 -m http.server 5173
# відкрити http://localhost:5173
```

## Деплой
Будь-який статичний хостинг (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Достатньо залити корінь репозиторію.

## Структура
- `index.html` — основна розмітка
- `styles.css` — стилі та анімації
- `script.js` — інтеракції (фільтри, лічильники, reveal, форма → Telegram)
- `assets/` — SVG логотипи
