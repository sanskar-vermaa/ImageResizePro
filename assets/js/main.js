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
