// HTML layout shared by every generated page.
import { SITE } from './site.config.mjs';
import { icons } from '../assets/js/core/icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** "/compress-image/" -> "../" ; "/" -> "./" */
export function relBase(path) {
  const depth = path.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}

const NAV = [
  { href: 'compress-image/', label: 'Compress' },
  { href: 'resize-image/', label: 'Resize' },
  { href: 'image-converter/', label: 'Convert' },
  { href: 'image-to-pdf/', label: 'Image to PDF' },
  { href: 'photo-signature-resizer/', label: 'Exam Photo' },
  { href: '#all-tools', label: 'All Tools', home: true },
];

function header(base, path) {
  const links = NAV.map((n) => {
    const href = n.home ? `${base}${n.href}` : `${base}${n.href}`;
    const current = `/${n.href}` === path ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${esc(n.label)}</a>`;
  }).join('');
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a href="${base}" class="brand" aria-label="${SITE.name} home">
        <img src="${base}assets/img/logo.svg" alt="" width="32" height="32" />
        <span>ImageResize<b>Pro</b></span>
      </a>
      <nav class="nav" id="site-nav" aria-label="Main">${links}</nav>
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark mode">${icons.moon}</button>
      <button class="icon-btn menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-controls="site-nav" aria-expanded="false">${icons.menu}</button>
    </div>
  </header>`;
}

function footer(base, groups) {
  const cols = groups
    .map(
      (g) => `<div><h4>${esc(g.title)}</h4><ul>${g.links
        .map((l) => `<li><a href="${base}${l.slug}/">${esc(l.name)}</a></li>`)
        .join('')}</ul></div>`,
    )
    .join('');
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="${base}" class="brand"><img src="${base}assets/img/logo.svg" alt="" width="32" height="32" /><span>ImageResize<b>Pro</b></span></a>
          <p class="muted" style="margin-top:12px">${esc(SITE.tagline)}. 100% free, no sign-up, and your files never leave your device.</p>
        </div>
        ${cols}
      </div>
      <div class="footer-bottom">
        <span>&copy; ${SITE.year} ${esc(SITE.name)}. All rights reserved.</span>
        <span>
          <a href="${base}about/">About</a> ·
          <a href="${base}contact/">Contact</a> ·
          <a href="${base}privacy-policy/">Privacy</a> ·
          <a href="${base}terms/">Terms</a> ·
          <a href="${base}disclaimer/">Disclaimer</a>
        </span>
      </div>
    </div>
  </footer>`;
}

function headExtras() {
  let out = '';
  if (SITE.googleVerification) out += `\n  <meta name="google-site-verification" content="${esc(SITE.googleVerification)}" />`;
  if (SITE.adsenseClient)
    out += `\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(SITE.adsenseClient)}" crossorigin="anonymous"></script>`;
  if (SITE.gaId)
    out += `\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${esc(SITE.gaId)}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${esc(SITE.gaId)}');</script>`;
  return out;
}

/** An ad placeholder. Renders a real AdSense unit once the publisher id + slot are configured. */
export function adSlot(position) {
  const slot = SITE.adSlots[position];
  if (SITE.adsenseClient && slot) {
    return `<div class="ad-slot has-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(SITE.adsenseClient)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
  }
  return `<div class="ad-slot" data-ad="${position}" aria-hidden="true"></div>`;
}

/**
 * Render a full HTML document.
 * @param {{ path: string, title: string, description: string, body: string, jsonLd?: object[], footerGroups: any[], ogImage?: string }} p
 */
export function layout(p) {
  const base = relBase(p.path);
  const canonical = `${SITE.url}${p.path}`;
  const og = p.ogImage || `${SITE.url}/assets/img/og-image.png`;
  const ld = (p.jsonLd || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#4f46e5" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(SITE.name)}" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${og}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="${base}assets/img/icon-192.png" />
  <link rel="manifest" href="${base}manifest.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
  <link rel="stylesheet" href="${base}assets/css/style.css" />
  <script>try{var t=localStorage.getItem('irp-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>${headExtras()}
  ${ld}
</head>
<body>${header(base, p.path)}
  <main id="main">
${p.body}
  </main>${footer(base, p.footerGroups)}
  <script type="module" src="${base}assets/js/main.js"></script>
</body>
</html>
`;
}
