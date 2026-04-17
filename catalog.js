// Catalog page renderer: category tabs + search + product grid

(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-to-top on reload
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => window.scrollTo(0, 0));

  // Nav scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Burger menu toggle (mobile)
  const burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', () => nav.classList.toggle('open'));

  // Custom cursor
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (cursor && ring && matchMedia('(pointer:fine)').matches) {
    let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    const loop = () => {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    // Delegated hover — works even with dynamically rendered cards
    const hoverTargets = 'a, button, input, [data-cursor], .cat-card, .cat-tab, .cart-item, .ci-btn, .ci-input';
    addEventListener('mouseover', e => { if (e.target.closest(hoverTargets)) ring.classList.add('hover'); });
    addEventListener('mouseout',  e => { if (e.target.closest(hoverTargets)) ring.classList.remove('hover'); });
  }

  const PRODUCTS = window.PRODUCTS || [];
  const CATEGORIES = window.CATEGORIES || [];

  const tabsEl = document.getElementById('catTabs');
  const gridEl = document.getElementById('catGrid');
  const searchEl = document.getElementById('catSearch');
  const emptyEl = document.getElementById('catEmpty');

  // Read category from URL hash (e.g., catalog.html#coffee)
  const hashCat = (location.hash || '').replace('#', '');
  const initialCat = CATEGORIES.find(c => c.id === hashCat) ? hashCat : 'all';

  let activeCat = initialCat;
  let query = '';

  // Render category tabs
  tabsEl.innerHTML = CATEGORIES.map(c => {
    const cnt = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
    return `<button type="button" class="cat-tab ${c.id === activeCat ? 'active' : ''}" data-cat="${c.id}">
      <span>${c.label}</span><em>${cnt}</em>
    </button>`;
  }).join('');
  tabsEl.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      // Clear search when user explicitly picks a category
      if (searchEl.value) { searchEl.value = ''; query = ''; }
      renderGrid();
      // Scroll the catalog section to top so first items are visible
      const anchor = document.querySelector('.cat-head') || gridEl;
      const nav = document.getElementById('nav');
      const offset = (nav?.offsetHeight || 64) + 16;
      const y = anchor.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  searchEl.addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  // Render product grid
  const renderGrid = () => {
    let list = PRODUCTS;
    if (activeCat !== 'all') list = list.filter(p => p.cat === activeCat);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => {
        const haystack = [
          p.name, p.subtitle, p.unit, catLabel(p.cat), p.cat
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    // Empty state ONLY when user actually searched something.
    // Picking a category should never leave the grid empty (every category has products),
    // but if data ever allows it, we simply skip the "nothing found" visual.
    if (list.length === 0) {
      gridEl.innerHTML = '';
      if (query) { emptyEl.hidden = false; } else { emptyEl.hidden = true; }
      return;
    }
    emptyEl.hidden = true;

    gridEl.innerHTML = list.map(p => `
      <article class="cat-card" data-id="${p.id}">
        <div class="cat-card-img">
          <img src="${p.photo}" alt="${p.name}" loading="lazy"/>
        </div>
        <div class="cat-card-body">
          <span class="cat-card-tag">${catLabel(p.cat)}</span>
          <h3>${p.name}</h3>
          <p>${p.subtitle || ''}</p>
          <span class="cat-card-unit">${p.unit || ''}</span>
          <button type="button" class="cat-add" data-cart-add="${p.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span>Додати в кошик</span>
          </button>
        </div>
      </article>
    `).join('');

    // Mark already-in-cart items
    markInCart();
  };

  const catLabel = (id) => (CATEGORIES.find(c => c.id === id) || {}).label || '';

  const markInCart = () => {
    const cartItems = (window.Cart?.get() || []);
    document.querySelectorAll('.cat-card').forEach(card => {
      const id = card.dataset.id;
      const inCart = cartItems.find(x => x.id === id);
      const btn = card.querySelector('.cat-add');
      if (inCart) {
        card.classList.add('in-cart');
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg><span>У кошику · ${inCart.qty} шт</span>`;
      } else {
        card.classList.remove('in-cart');
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg><span>Додати в кошик</span>`;
      }
    });
  };

  // Refresh "in cart" badges whenever cart changes
  document.addEventListener('cart:change', markInCart);
  // Cross-tab: if user opened another tab
  addEventListener('storage', (e) => { if (e.key === 'doubleo_cart_v1') markInCart(); });

  renderGrid();
})();
