// Site entry point: header behaviour + lazy-mount the tool on this page.
import { initTheme } from './core/theme.js';
import { icons } from './core/icons.js';
import { toastError } from './core/toast.js';

initTheme(document.getElementById('theme-toggle'));

// Mobile menu
const menuBtn = document.getElementById('menu-toggle');
const nav = document.getElementById('site-nav');
if (menuBtn && nav) {
  menuBtn.innerHTML = icons.menu;
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
}

// Mount the tool, if this page has one: <div id="tool" data-tool="compress" data-options='{}'>
const host = document.getElementById('tool');
if (host) {
  const name = host.dataset.tool;
  let options = {};
  try {
    options = JSON.parse(host.dataset.options || '{}');
  } catch {
    /* ignore bad options */
  }
  import(`./tools/${name}.js`)
    .then((mod) => mod.default(host, options))
    .catch((err) => {
      console.error(err);
      host.innerHTML = '<p class="muted" style="text-align:center">Sorry, this tool failed to load. Please refresh the page.</p>';
      toastError('Tool failed to load.');
    });
}

// Home page: instant search + category filter over the tool grid.
const search = document.getElementById('tool-search');
const grid = document.querySelector('.tool-grid');
if (search && grid) {
  const cards = [...grid.querySelectorAll('.tool-card')];
  const empty = grid.querySelector('.empty-state');
  const chips = [...document.querySelectorAll('.chip[data-filter]')];
  let cat = 'all';
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    let shown = 0;
    cards.forEach((c) => {
      const okCat = cat === 'all' || c.dataset.cat === cat;
      const okQ = words.every((w) => c.dataset.search.includes(w));
      const ok = okCat && okQ;
      c.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    empty?.classList.toggle('hidden', shown > 0);
  };
  search.addEventListener('input', apply);
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = cards.find((c) => !c.classList.contains('hidden'));
      if (first) window.location.href = first.href;
    }
  });
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      cat = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      apply();
    }),
  );
  // "/" focuses search, like many web apps
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search && !/input|textarea/i.test(document.activeElement?.tagName)) {
      e.preventDefault();
      search.focus();
    }
  });
}

// Offline support (PWA). The service worker lives at the site root next to index.html.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    const swUrl = new URL('../../sw.js', import.meta.url);
    navigator.serviceWorker.register(swUrl, { scope: new URL('../../', import.meta.url).pathname }).catch(() => {});
  });
}
