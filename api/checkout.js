// Vercel Serverless Function — accepts cart checkout, posts to Telegram
// POST /api/checkout
// Body: { name, phone, msg, items: [{ id, name, subtitle, unit, qty }], meta }
// Env vars (set in Vercel Dashboard → Project → Settings → Environment Variables):
//   TG_BOT_TOKEN  — Telegram bot token from @BotFather
//   TG_CHAT_ID    — target chat ID (group starts with -100..., user is positive int)

const MAX_ITEMS = 60;
const MAX_NAME_LEN = 80;
const MAX_MSG_LEN = 800;

// Simple in-memory rate limit per IP (resets on cold start — fine for abuse mitigation)
const RATE = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;

const escapeHTML = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const isValidPhone = (v) => /^\+380\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(v || '');

const json = (res, status, obj) => {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(obj));
};

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  const { TG_BOT_TOKEN, TG_CHAT_ID } = process.env;
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.error('Missing TG_BOT_TOKEN or TG_CHAT_ID env vars');
    return json(res, 500, { ok: false, error: 'Server not configured' });
  }

  // Rate limit by IP
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const rec = RATE.get(ip) || { count: 0, ts: now };
  if (now - rec.ts > RATE_WINDOW_MS) {
    rec.count = 0;
    rec.ts = now;
  }
  rec.count += 1;
  RATE.set(ip, rec);
  if (rec.count > RATE_MAX) {
    return json(res, 429, { ok: false, error: 'Забагато запитів. Спробуйте за хвилину.' });
  }

  // Parse body (Vercel auto-parses JSON if Content-Type: application/json)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return json(res, 400, { ok: false, error: 'Invalid JSON' }); }
  }
  if (!body || typeof body !== 'object') return json(res, 400, { ok: false, error: 'Empty body' });

  // Honeypot: silently discard bots
  if (body.website && String(body.website).trim() !== '') {
    return json(res, 200, { ok: true }); // pretend success
  }

  const name = String(body.name || '').trim().slice(0, MAX_NAME_LEN);
  const phone = String(body.phone || '').trim();
  const msg = String(body.msg || '').trim().slice(0, MAX_MSG_LEN);
  const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
  const meta = body.meta && typeof body.meta === 'object' ? body.meta : {};

  // Validation
  if (name.length < 2) return json(res, 400, { ok: false, error: 'Вкажіть ім\'я' });
  if (!isValidPhone(phone)) return json(res, 400, { ok: false, error: 'Некоректний телефон' });
  if (items.length === 0) return json(res, 400, { ok: false, error: 'Порожнє замовлення' });

  // Build message (HTML parse mode)
  const totalUnits = items.reduce((s, it) => s + (parseInt(it.qty) || 0), 0);
  const lines = [];
  lines.push('🛒 <b>НОВЕ ЗАМОВЛЕННЯ</b>');
  lines.push('DOUBLEO HoReCa');
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━');
  items.forEach((it, i) => {
    const nm = escapeHTML(it.name || it.id || 'Товар');
    const sub = it.subtitle ? escapeHTML(it.subtitle) : '';
    const unit = escapeHTML(it.unit || 'шт');
    const qty = parseInt(it.qty) || 0;
    lines.push(`<b>${i + 1}. ${nm}</b>`);
    if (sub) lines.push(`   <i>${sub}</i>`);
    lines.push(`   📦 Кількість: <b>${qty}</b> × ${unit}`);
    lines.push('');
  });
  lines.push('━━━━━━━━━━━━━━━');
  lines.push(`Разом: <b>${items.length}</b> позицій · <b>${totalUnits}</b> шт`);
  lines.push('');
  lines.push('<b>👤 Клієнт:</b>');
  lines.push(`   Ім'я: ${escapeHTML(name)}`);
  lines.push(`   Телефон: <a href="tel:${encodeURIComponent(phone.replace(/\s/g, ''))}">${escapeHTML(phone)}</a>`);
  if (msg) {
    lines.push('');
    lines.push(`<b>💬 Коментар:</b>`);
    lines.push(`   ${escapeHTML(msg)}`);
  }

  const text = lines.join('\n');

  // Send to Telegram
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const tgData = await tgRes.json().catch(() => ({}));
    if (!tgRes.ok || !tgData.ok) {
      console.error('Telegram error:', tgData);
      return json(res, 502, {
        ok: false,
        error: 'Не вдалося надіслати в Telegram',
        detail: tgData.description || null,
      });
    }
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('sendMessage failed:', err);
    return json(res, 500, { ok: false, error: 'Помилка сервера' });
  }
};
