// --- Scroll behaviour: on reload → always top; on direct hash link → scroll to section ---
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const navType = performance.getEntriesByType('navigation')[0]?.type;
if (navType === 'reload' && location.hash) {
  // Strip hash on reload so page opens at top
  history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('load', () => {
  if (location.hash && navType !== 'reload') {
    const target = document.querySelector(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
  } else {
    window.scrollTo(0, 0);
  }
});

// year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Custom cursor ---
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
if (matchMedia('(pointer:fine)').matches) {
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
  const loop = () => {
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a, button, [data-cursor], .product, .bt').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

// --- Nav scroll + burger ---
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 20);
addEventListener('scroll', onScroll, {passive:true}); onScroll();
document.getElementById('burger').addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// --- Reveal on scroll ---
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }});
}, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
// Fallback: reveal anything still hidden after 2.5s
setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 2500);

// --- Counters ---
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; const target = +el.dataset.count; const dur = 1800; const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t-start)/dur);
      el.textContent = Math.floor(target * (1 - Math.pow(1-p, 3)));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + '+';
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

// --- Magnetic buttons (desktop only) ---
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.magnet').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      btn.style.transform = `translate(${x*.2}px, ${y*.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// --- Reels: sound toggle (only one unmuted at a time) ---
const reels = document.querySelectorAll('.reel');
const reelData = [...reels].map(reel => ({
  reel, video: reel.querySelector('video'), btn: reel.querySelector('.reel-sound'),
}));
const muteAll = () => reelData.forEach(({video, btn}) => {
  video.muted = true;
  btn.dataset.muted = 'true';
  btn.setAttribute('aria-label', 'Увімкнути звук');
});
reelData.forEach(({video, btn}, idx) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isMuted = btn.dataset.muted === 'true';
    if (isMuted) {
      // Unmute this one, mute others
      reelData.forEach(({video: v, btn: b}, i) => {
        if (i !== idx) { v.muted = true; b.dataset.muted = 'true'; b.setAttribute('aria-label', 'Увімкнути звук'); }
      });
      video.muted = false;
      video.play().catch(() => {});
      btn.dataset.muted = 'false';
      btn.setAttribute('aria-label', 'Вимкнути звук');
    } else {
      video.muted = true;
      btn.dataset.muted = 'true';
      btn.setAttribute('aria-label', 'Увімкнути звук');
    }
  });
});
// Auto-mute when reel scrolls out of view
const reelIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) {
      const video = e.target.querySelector('video');
      const btn = e.target.querySelector('.reel-sound');
      if (video && !video.muted) {
        video.muted = true; btn.dataset.muted = 'true'; btn.setAttribute('aria-label', 'Увімкнути звук');
      }
    }
  });
}, { threshold: 0.25 });
reels.forEach(r => reelIO.observe(r));

// --- Lightbox for product cards ---
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbDesc = document.getElementById('lbDesc');
const lbMeta = document.getElementById('lbMeta');
const lbTag = document.getElementById('lbTag');
const lbClose = document.getElementById('lbClose');

const lbCtaEl = document.getElementById('lbCta');
const openLightbox = (product) => {
  const photo = product.dataset.photo;
  const title = product.dataset.title || '';
  const desc = product.dataset.desc || '';
  const meta = product.dataset.meta || '';
  const cat = product.dataset.cat || '';
  const tag = product.querySelector('.product-tag')?.textContent || 'Каталог';

  lbImg.src = photo;
  lbImg.alt = title;
  lbTitle.textContent = title;
  lbDesc.textContent = desc;
  lbTag.textContent = tag;
  lbMeta.innerHTML = meta.split('|').map(s => `<li>${s.trim()}</li>`).join('');
  if (lbCtaEl && cat) lbCtaEl.href = `catalog.html#${cat}`;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lb-open');
};
const closeLightbox = () => {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lb-open');
};

document.querySelectorAll('.product[data-photo]').forEach(card => {
  card.addEventListener('click', (e) => {
    // Don't open on "Замовити" button click
    if (e.target.closest('.product-link')) return;
    openLightbox(card);
  });
});
lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox(); });

// Close lightbox when tapping CTA (so user sees the form)
const lbCta = document.getElementById('lbCta');
if (lbCta) {
  lbCta.addEventListener('click', () => {
    // Pre-select the product in form dropdown
    const typeSel = document.getElementById('f-type');
    const title = document.getElementById('lbTitle').textContent.trim();
    if (typeSel) {
      const lowTitle = title.toLowerCase();
      const match = [...typeSel.options].find(o => {
        const words = o.value.split(/\s+/).filter(w => w.length > 3);
        return words.some(w => lowTitle.includes(w.toLowerCase()));
      });
      if (match) typeSel.value = match.value;
    }
    closeLightbox();
  });
}

// --- Form → Telegram ---
const form = document.getElementById('orderForm');
const toast = document.getElementById('toast');
const phoneInput = document.getElementById('f-phone');
const nameInput = document.getElementById('f-name');

// Format UA phone: +380 XX XXX XX XX
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
const isValidUaPhone = (val) => /^\+380\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/.test(val);

phoneInput.addEventListener('focus', () => {
  if (!phoneInput.value) phoneInput.value = '+380 ';
  // Move cursor to end
  requestAnimationFrame(() => {
    const len = phoneInput.value.length;
    phoneInput.setSelectionRange(len, len);
  });
});
phoneInput.addEventListener('input', (e) => {
  const cursorAtEnd = e.target.selectionStart === e.target.value.length;
  e.target.value = formatUaPhone(e.target.value);
  if (cursorAtEnd) e.target.setSelectionRange(e.target.value.length, e.target.value.length);
  phoneInput.closest('.field').classList.remove('invalid');
});
phoneInput.addEventListener('blur', () => {
  if (phoneInput.value === '+380' || phoneInput.value === '+380 ') phoneInput.value = '';
});

// Nice inline alert
const formAlert = document.getElementById('formAlert');
const faTitle = document.getElementById('faTitle');
const faMsg = document.getElementById('faMsg');
const faCloseBtn = formAlert?.querySelector('.fa-close');
let faTimer;

const showFormAlert = (title, msg) => {
  faTitle.textContent = title;
  faMsg.textContent = msg;
  formAlert.classList.remove('show');
  void formAlert.offsetWidth; // restart animation
  formAlert.classList.add('show', 'error');
  clearTimeout(faTimer);
  faTimer = setTimeout(() => formAlert.classList.remove('show'), 6000);
  // Scroll form into view on mobile
  if (innerWidth < 720) formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
const hideFormAlert = () => formAlert.classList.remove('show');
faCloseBtn?.addEventListener('click', hideFormAlert);

const markInvalid = (input) => {
  const field = input.closest('.field');
  field.classList.add('invalid');
  input.focus({ preventScroll: true });
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  form.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const errors = [];

  if (name.length < 2) { markInvalid(nameInput); errors.push({field:'name', msg:'Вкажіть ваше ім\'я (мін. 2 символи)'}); }
  if (!isValidUaPhone(phone)) {
    markInvalid(phoneInput);
    errors.push({field:'phone', msg:'Некоректний телефон. Формат: +380 XX XXX XX XX'});
  }

  if (errors.length > 0) {
    const titleTxt = errors.length === 1 ? 'Перевірте поле' : 'Перевірте декілька полів';
    const msgTxt = errors.map(e => '• ' + e.msg).join('\n');
    showFormAlert(titleTxt, msgTxt);
    return;
  }

  hideFormAlert();
  const d = Object.fromEntries(new FormData(form).entries());
  const submitBtn = form.querySelector('[type="submit"]');
  const origBtnHTML = submitBtn ? submitBtn.innerHTML : '';

  // Send as single "Швидкий запит" item to the same /api/checkout
  const payload = {
    name: d.name,
    phone: d.phone,
    msg: `[Швидкий запит] Цікавить: ${d.type || '-'}${d.msg ? ' · ' + d.msg : ''}`,
    website: d.website || '',
    items: [{ id: 'quick-request', name: 'Швидкий запит (форма сайту)', subtitle: d.type || '', unit: 'консультація', qty: 1 }],
    meta: { page: location.pathname + ' · quick-form' },
  };

  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="cart-spinner"></span> Надсилаємо...'; }

  fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => r.json().then(data => ({ ok: r.ok && data.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error || 'Send failed');
      toast.classList.add('show');
      form.reset();
      setTimeout(() => toast.classList.remove('show'), 6000);
    })
    .catch(err => {
      console.error('[form]', err);
      // Fallback to direct Telegram link
      const text = `Новий запит з сайту DOUBLEO%0A%0AІм'я: ${d.name}%0AТелефон: ${d.phone}%0AЦікавить: ${d.type}%0AКоментар: ${d.msg || '-'}`;
      showFormAlert('Проблема з сервером', 'Відкриваємо Telegram — натисніть Send, будь ласка.');
      window.open(`https://t.me/sfrn_app?text=${text}`, '_blank');
    })
    .finally(() => {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origBtnHTML; }
    });
});

// Hide alert when user corrects a field
[nameInput, phoneInput].forEach(inp => {
  inp.addEventListener('input', () => {
    inp.closest('.field').classList.remove('invalid');
    if (formAlert.classList.contains('show')) {
      // Only hide if all fields now look valid
      const nameOk = nameInput.value.trim().length >= 2;
      const phoneOk = isValidUaPhone(phoneInput.value.trim());
      if (nameOk && phoneOk) hideFormAlert();
    }
  });
});

// --- Viber fallback: if app not installed, show toast with number ---
document.querySelectorAll('a[href^="viber://"]').forEach(link => {
  link.addEventListener('click', () => {
    // Let browser try to open Viber; after 1.2s show hint toast (if still on page)
    let hidden = false;
    const markHidden = () => { hidden = true; };
    document.addEventListener('visibilitychange', markHidden, { once: true });
    setTimeout(() => {
      document.removeEventListener('visibilitychange', markHidden);
      if (hidden) return; // Viber opened → page became hidden
      const t = document.createElement('div');
      t.className = 'cart-toast show';
      t.style.maxWidth = '320px';
      t.style.textAlign = 'center';
      t.style.lineHeight = '1.4';
      t.innerHTML = 'Якщо Viber не відкрився — встановіть додаток або зателефонуйте:<br/><strong>+380 93 968 68 54</strong>';
      document.body.appendChild(t);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 5000);
    }, 1400);
  });
});

// --- Phone picker: choose operator (Lifecell / Kyivstar) ---
const phonePickBtn = document.querySelector('[data-phone-picker]');
if (phonePickBtn) {
  const overlay = document.createElement('div');
  overlay.className = 'phone-picker';
  overlay.innerHTML = `
    <div class="pp-backdrop"></div>
    <div class="pp-sheet" role="dialog" aria-label="Оберіть оператора">
      <h4>Оберіть оператора</h4>
      <p class="pp-hint">Зателефонуйте зручним для вас оператором — у нас обидва.</p>
      <a href="tel:+380939686854" class="pp-option">
        <span class="pp-op op-life">lifecell</span>
        <span class="pp-num">+380 93 968 68 54</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
      <a href="tel:+380979686854" class="pp-option">
        <span class="pp-op op-ks">Kyivstar</span>
        <span class="pp-num">+380 97 968 68 54</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
      <button type="button" class="pp-cancel">Закрити</button>
    </div>`;
  document.body.appendChild(overlay);
  const closePP = () => overlay.classList.remove('open');
  phonePickBtn.addEventListener('click', () => overlay.classList.add('open'));
  overlay.querySelector('.pp-backdrop').addEventListener('click', closePP);
  overlay.querySelector('.pp-cancel').addEventListener('click', closePP);
  overlay.querySelectorAll('.pp-option').forEach(a => a.addEventListener('click', () => setTimeout(closePP, 200)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePP(); });
}

// --- Sync dynamic product count across page ---
const productCount = (window.PRODUCTS || []).length;
if (productCount > 0) {
  document.querySelectorAll('[data-dynamic="products"]').forEach(el => {
    el.textContent = productCount;
    if (el.hasAttribute('data-count')) el.setAttribute('data-count', productCount);
  });
}

// --- Hero parallax orbit (desktop only) ---
const orbit = document.querySelector('.orbit');
if (orbit && matchMedia('(pointer:fine)').matches) {
  addEventListener('mousemove', (e) => {
    const x = (e.clientX / innerWidth - .5) * 24;
    const y = (e.clientY / innerHeight - .5) * 24;
    orbit.style.translate = `${x}px ${y}px`;
  });
}

// --- Live Open Status ---
const checkOpenStatus = () => {
  const liveEl = document.querySelector('.live');
  if (!liveEl) return;
  const now = new Date();
  const kyivTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Kiev' });
  const kyivTime = new Date(kyivTimeStr);
  const day = kyivTime.getDay();
  const hour = kyivTime.getHours();
  
  let isOpen = false;
  if (day >= 1 && day <= 5) { // Mon-Fri 9:00 - 18:00
    if (hour >= 9 && hour < 18) isOpen = true;
  } else if (day === 6) { // Sat 10:00 - 15:00
    if (hour >= 10 && hour < 15) isOpen = true;
  }
  
  if (isOpen) {
    liveEl.textContent = 'Склад відкрито';
    liveEl.classList.remove('closed');
  } else {
    liveEl.textContent = 'Склад закрито';
    liveEl.classList.add('closed');
  }
};
checkOpenStatus();
setInterval(checkOpenStatus, 60000);
