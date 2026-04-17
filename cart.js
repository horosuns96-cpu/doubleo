// Pseudo-cart: select products → send structured order to Telegram
// Persists via localStorage. Self-creates floating button + drawer UI.
// Exposes window.Cart API: add(id, qty), remove(id), set(id, qty), clear(), get(), count(), open(), close().

(function () {
  const STORAGE_KEY = 'doubleo_cart_v1';
  const TG_CHANNEL = 'sfrn_app'; // TEMP: тимчасово орієнтуємо замовлення на тестовий акаунт

  // ---------- State ----------
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  };
  // Debounced persistence — avoids localStorage thrash on rapid +/− clicks
  let saveTimer = null;
  const saveState = () => {
    if (saveTimer) return;
    saveTimer = requestAnimationFrame(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      saveTimer = null;
      // Notify listeners (e.g., catalog page "in cart" badges)
      document.dispatchEvent(new CustomEvent('cart:change'));
    });
  };

  let items = readState();

  // ---------- Helpers ----------
  const findProduct = (id) => (window.PRODUCTS || []).find(p => p.id === id);
  const count = () => items.reduce((s, x) => s + x.qty, 0);

  // ---------- Public API ----------
  const add = (id, qty = 1) => {
    const existing = items.find(x => x.id === id);
    if (existing) existing.qty = Math.min(9999, existing.qty + qty);
    else items.push({ id, qty });
    saveState();
    renderList();          // structural change
    pulseButton();
    showToast('Додано до кошика');
  };
  // set — optimized for rapid +/− clicks; only full rebuild on qty=0 (row disappears)
  const set = (id, qty) => {
    qty = Math.max(0, Math.min(9999, parseInt(qty) || 0));
    const existing = items.find(x => x.id === id);
    if (!existing) return;
    if (qty === 0) {
      items = items.filter(x => x.id !== id);
      saveState();
      renderList();        // item removed → rebuild
    } else {
      existing.qty = qty;
      saveState();
      syncRow(id);         // surgical: update only this row's input
      syncBadges();        // update fab badge + subtitle
    }
  };
  const remove = (id) => { items = items.filter(x => x.id !== id); saveState(); renderList(); };
  const clear = () => { items = []; saveState(); renderList(); };

  window.Cart = {
    add, set, remove, clear,
    get: () => [...items],
    count,
    open: () => openDrawer(),
    close: () => closeDrawer(),
  };

  // ---------- UI: floating button + drawer ----------
  const inject = () => {
    if (document.getElementById('cartFab')) return;

    // Floating button
    const btn = document.createElement('button');
    btn.id = 'cartFab';
    btn.className = 'cart-fab';
    btn.setAttribute('aria-label', 'Кошик');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
      <span class="cart-fab-count" id="cartFabCount">0</span>`;
    btn.addEventListener('click', openDrawer);
    document.body.appendChild(btn);

    // Drawer + backdrop
    const wrap = document.createElement('div');
    wrap.id = 'cartDrawer';
    wrap.className = 'cart-drawer';
    wrap.innerHTML = `
      <div class="cart-backdrop" data-close></div>
      <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Кошик замовлення">
        <header class="cart-head">
          <div>
            <h3>Ваше замовлення</h3>
            <span class="cart-sub" id="cartSubtitle">Порожньо</span>
          </div>
          <button class="cart-close" data-close aria-label="Закрити">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <div class="cart-body" id="cartBody">
          <!-- Items injected here -->
        </div>

        <form class="cart-checkout" id="cartCheckout" novalidate>
          <h4>Контактні дані</h4>
          <!-- Honeypot: hidden from users, bots fill it -->
          <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute; left:-9999px; width:1px; height:1px; opacity:0"/>
          <div class="cf-field">
            <input type="text" id="cartName" placeholder=" " required minlength="2"/>
            <label for="cartName">Ваше ім'я</label>
          </div>
          <div class="cf-field">
            <input type="tel" id="cartPhone" placeholder=" " required maxlength="19" inputmode="tel" autocomplete="tel"/>
            <label for="cartPhone">Телефон</label>
            <small class="cf-hint">+380 XX XXX XX XX</small>
          </div>
          <div class="cf-field">
            <textarea id="cartMsg" placeholder=" " rows="2"></textarea>
            <label for="cartMsg">Коментар (опційно)</label>
          </div>
          <div class="cart-alert" id="cartAlert" role="alert"></div>
          <button type="submit" class="cart-submit magnet">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21.5 4.2 2.7 11.4c-.9.3-.9 1.6.1 1.9l4.7 1.5 1.8 5.7c.2.7 1.1.9 1.6.3l2.6-2.8 4.8 3.5c.6.5 1.5.1 1.7-.7L22.7 5.4c.2-.9-.6-1.6-1.2-1.2Z"/></svg>
            <span>Надіслати замовлення в Telegram</span>
          </button>
          <small class="cart-notice">Ми передзвонимо за 15 хвилин для підтвердження.</small>
        </form>

        <div class="cart-empty" id="cartEmpty">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".35"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          <p>Кошик порожній</p>
          <a href="catalog.html" class="cart-empty-cta">Перейти в каталог →</a>
        </div>
      </aside>`;
    document.body.appendChild(wrap);

    // Drawer events
    wrap.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && wrap.classList.contains('open')) closeDrawer(); });

    // Phone formatter for checkout
    const phoneEl = wrap.querySelector('#cartPhone');
    phoneEl.addEventListener('focus', () => { if (!phoneEl.value) phoneEl.value = '+380 '; setTimeout(()=>phoneEl.setSelectionRange(phoneEl.value.length, phoneEl.value.length), 0); });
    phoneEl.addEventListener('input', () => { phoneEl.value = formatUaPhone(phoneEl.value); });
    phoneEl.addEventListener('blur', () => { if (phoneEl.value === '+380 ' || phoneEl.value === '+380') phoneEl.value = ''; });

    // Checkout
    wrap.querySelector('#cartCheckout').addEventListener('submit', onCheckout);
  };

  const openDrawer = () => {
    const d = document.getElementById('cartDrawer');
    d.classList.add('open');
    d.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    renderList();
  };
  const closeDrawer = () => {
    const d = document.getElementById('cartDrawer');
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
  };

  // ---------- Render (surgical + full) ----------

  // Only badge + subtitle (cheap, called on every +/-)
  const syncBadges = () => {
    const fab = document.getElementById('cartFab');
    const fabCount = document.getElementById('cartFabCount');
    const subtitle = document.getElementById('cartSubtitle');
    if (!fab) return;
    const n = count();
    fabCount.textContent = n;
    fab.classList.toggle('has-items', n > 0);
    if (subtitle) {
      subtitle.textContent = items.length === 0
        ? 'Порожньо'
        : `${items.length} ${plural(items.length, 'позиція', 'позиції', 'позицій')} · ${n} ${plural(n, 'шт.', 'шт.', 'шт.')}`;
    }
  };

  // Update only a single row's qty input (no rebuild)
  const syncRow = (id) => {
    const row = document.querySelector(`.cart-item[data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    const item = items.find(x => x.id === id);
    if (!item) return;
    const input = row.querySelector('.ci-input');
    if (input && document.activeElement !== input) input.value = item.qty;
  };

  // Build one row's markup
  const rowHTML = (it) => {
    const p = findProduct(it.id);
    if (!p) return '';
    return `
      <div class="cart-item" data-id="${p.id}">
        <div class="ci-img"><img src="${p.photo}" alt="${p.name}" loading="lazy" decoding="async"/></div>
        <div class="ci-info">
          <strong>${p.name}</strong>
          <span>${p.subtitle}</span>
          <span class="ci-unit">${p.unit}</span>
        </div>
        <div class="ci-qty">
          <button type="button" class="ci-btn" data-dec aria-label="Менше">−</button>
          <input type="number" class="ci-input" value="${it.qty}" min="1" max="9999" inputmode="numeric" aria-label="Кількість"/>
          <button type="button" class="ci-btn" data-inc aria-label="Більше">+</button>
        </div>
        <button type="button" class="ci-remove" aria-label="Прибрати">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>`;
  };

  // Full rebuild (only on add/remove/clear)
  const renderList = () => {
    syncBadges();
    const body = document.getElementById('cartBody');
    const empty = document.getElementById('cartEmpty');
    const checkout = document.getElementById('cartCheckout');
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'flex';
      checkout.style.display = 'none';
    } else {
      empty.style.display = 'none';
      checkout.style.display = 'flex';
      body.innerHTML = items.map(rowHTML).join('');
    }
  };

  // Event delegation — attach once (not re-bound on every render)
  const bindBodyEvents = () => {
    const body = document.getElementById('cartBody');
    if (!body || body._bound) return;
    body._bound = true;

    body.addEventListener('click', (e) => {
      const row = e.target.closest('.cart-item');
      if (!row) return;
      const id = row.dataset.id;
      if (e.target.closest('[data-dec]')) {
        const cur = items.find(x => x.id === id)?.qty || 0;
        set(id, cur - 1);
      } else if (e.target.closest('[data-inc]')) {
        const cur = items.find(x => x.id === id)?.qty || 0;
        set(id, cur + 1);
      } else if (e.target.closest('.ci-remove')) {
        remove(id);
      }
    });
    body.addEventListener('change', (e) => {
      const inp = e.target.closest('.ci-input');
      if (!inp) return;
      const id = e.target.closest('.cart-item').dataset.id;
      set(id, inp.value);
    });
  };

  const pulseButton = () => {
    const fab = document.getElementById('cartFab');
    if (!fab) return;
    fab.classList.remove('pulse');
    void fab.offsetWidth;
    fab.classList.add('pulse');
  };

  // ---------- Toast ----------
  const showToast = (text) => {
    let t = document.getElementById('cartToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cartToast';
      t.className = 'cart-toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('show'), 2200);
  };

  // ---------- Utilities ----------
  const plural = (n, one, few, many) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  };
  const formatUaPhone = (raw) => {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('380')) digits = digits.slice(3);
    else if (digits.startsWith('80')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 9);
    let out = '+380';
    if (digits.length > 0) out += ' ' + digits.slice(0, 2);
    if (digits.length > 2) out += ' ' + digits.slice(2, 5);
    if (digits.length > 5) out += ' ' + digits.slice(5, 7);
    if (digits.length > 7) out += ' ' + digits.slice(7, 9);
    return out;
  };
  const isValidUaPhone = v => /^\+380\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/.test(v);

  // ---------- Checkout ----------
  const onCheckout = async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('cartName');
    const phoneEl = document.getElementById('cartPhone');
    const msgEl = document.getElementById('cartMsg');
    const alertEl = document.getElementById('cartAlert');
    const submitBtn = e.target.querySelector('[type="submit"]');

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();

    alertEl.classList.remove('show');
    if (name.length < 2) return showAlert(alertEl, 'Вкажіть ваше ім\'я (мін. 2 символи)', nameEl);
    if (!isValidUaPhone(phone)) return showAlert(alertEl, 'Некоректний телефон. Формат: +380 XX XXX XX XX', phoneEl);
    if (items.length === 0) return;

    // Payload for API
    const payload = {
      name,
      phone,
      msg: msgEl.value.trim(),
      website: e.target.website?.value || '',  // honeypot
      items: items.map(it => {
        const p = findProduct(it.id);
        return p ? { id: p.id, name: p.name, subtitle: p.subtitle, unit: p.unit, qty: it.qty } : null;
      }).filter(Boolean),
      meta: { page: location.pathname + location.search },
    };

    // Loading state
    if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.origText = submitBtn.innerHTML; submitBtn.innerHTML = '<span class="cart-spinner"></span> Надсилаємо...'; }

    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.error || 'Помилка відправки');

      // Success
      clear();
      nameEl.value = ''; phoneEl.value = ''; msgEl.value = '';
      showSuccessModal();
      setTimeout(closeDrawer, 400);
    } catch (err) {
      // API failed → fallback to direct t.me/ link so user isn't stuck
      const fallbackText = buildFallbackText(payload);
      showAlert(alertEl,
        'Не вдалося відправити автоматично. Натисніть «Надіслати через Telegram» — відкриється чат, де залишиться натиснути Send.',
        null);
      alertEl.innerHTML = `
        Не вдалося відправити автоматично. <br/>
        <a href="https://t.me/${TG_CHANNEL}?text=${encodeURIComponent(fallbackText)}" target="_blank" rel="noopener" style="color:var(--accent); font-weight:600; text-decoration:underline">Надіслати через Telegram →</a>
      `;
      alertEl.classList.add('show');
      console.error('[checkout]', err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = submitBtn.dataset.origText || 'Надіслати замовлення'; }
    }
  };

  const buildFallbackText = (p) => {
    const lines = [];
    lines.push('🛒 НОВЕ ЗАМОВЛЕННЯ з сайту DOUBLEO');
    lines.push('');
    lines.push('Товари:');
    p.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name} — ${it.qty} × ${it.unit}`);
      if (it.subtitle) lines.push(`   └ ${it.subtitle}`);
    });
    lines.push('');
    lines.push(`Контакти: ${p.name} · ${p.phone}`);
    if (p.msg) lines.push(`Коментар: ${p.msg}`);
    return lines.join('\n');
  };

  // Success modal
  const showSuccessModal = () => {
    let m = document.getElementById('cartSuccess');
    if (!m) {
      m = document.createElement('div');
      m.id = 'cartSuccess';
      m.className = 'cart-success';
      m.innerHTML = `
        <div class="cs-backdrop"></div>
        <div class="cs-sheet" role="dialog" aria-live="polite">
          <div class="cs-check">
            <svg viewBox="0 0 52 52" width="64" height="64" fill="none">
              <circle cx="26" cy="26" r="24" stroke="currentColor" stroke-width="2.5" class="cs-circle"/>
              <path d="M14 27l8 8 16-18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="cs-tick"/>
            </svg>
          </div>
          <h3>Замовлення прийнято</h3>
          <p>Менеджер зв'яжеться з вами протягом <strong>15 хвилин</strong> у робочий час для уточнення деталей та способу оплати.</p>
          <button type="button" class="cs-ok">Дякую</button>
        </div>`;
      document.body.appendChild(m);
      const close = () => m.classList.remove('open');
      m.querySelector('.cs-backdrop').addEventListener('click', close);
      m.querySelector('.cs-ok').addEventListener('click', close);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
    requestAnimationFrame(() => m.classList.add('open'));
  };

  const showAlert = (el, msg, focusField) => {
    el.textContent = msg;
    el.classList.add('show');
    focusField?.focus();
    setTimeout(() => el.classList.remove('show'), 5000);
  };

  // ---------- Wire up "Add to cart" buttons via event delegation ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cart-add]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.cartAdd;
    if (id) add(id);
  });

  // ---------- Init ----------
  const boot = () => { inject(); bindBodyEvents(); renderList(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
