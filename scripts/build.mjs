// Static site generator: writes one HTML page per tool + home, legal pages, sitemap and robots.txt.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './site.config.mjs';
import { layout, esc, adSlot } from './layout.mjs';
import { TOOLS, CATEGORIES } from './content/tools.mjs';
import { STATIC_PAGES } from './content/static-pages.mjs';
import { icon } from '../assets/js/core/icons.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const written = [];

function write(path, html) {
  const file = path === '/' ? join(ROOT, 'index.html') : join(ROOT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  written.push(path);
}

const bySlug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

function footerGroups() {
  const pick = (cat, n = 6) => TOOLS.filter((t) => t.category === cat).slice(0, n);
  return [
    { title: 'Compress & Resize', links: [...pick('compress', 4), ...pick('resize', 3)] },
    { title: 'Convert & PDF', links: [...pick('convert', 4), ...pick('pdf', 3)] },
    { title: 'Edit & More', links: [...pick('edit', 4), ...pick('utility', 3)] },
  ].filter((g) => g.links.length);
}

const DEFAULT_FEATURES = [
  { h: '100% private', p: 'Images are processed inside your browser. Nothing is uploaded to any server.' },
  { h: 'Fast & free', p: 'No sign-up, no watermark, no limits. Works instantly on phone and desktop.' },
  { h: 'Batch processing', p: 'Work on many images at once and download them together as a ZIP.' },
  { h: 'Works offline', p: 'Once loaded, the tools keep working even without an internet connection.' },
];

function toolPage(t) {
  const path = `/${t.slug}/`;
  const url = `${SITE.url}${path}`;
  const features = t.features || DEFAULT_FEATURES;
  const related = (t.related || []).map((s) => bySlug[s]).filter(Boolean);
  const auto = TOOLS.filter((x) => x.category === t.category && x.slug !== t.slug && !t.related?.includes(x.slug));
  const relatedAll = [...related, ...auto].slice(0, 8);

  const body = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="../">Home</a></li><li>${esc(t.name)}</li></ol></nav>
      <section class="tool-head">
        <h1>${esc(t.h1 || t.name)}</h1>
        <p>${esc(t.intro)}</p>
      </section>
      ${adSlot('top')}
      <section class="workspace" aria-label="${esc(t.name)} tool">
        <div id="tool" data-tool="${t.tool}" data-options='${esc(JSON.stringify(t.options || {}))}'>
          <p class="muted" style="text-align:center;padding:60px 0">Loading tool…</p>
        </div>
      </section>
      <div class="content">
        <section>
          <h2>How to ${esc(t.howTitle || t.name.toLowerCase())}</h2>
          <ol class="steps">${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        </section>
        ${adSlot('middle')}
        <section>
          <h2>Why use ${esc(SITE.name)}?</h2>
          <div class="feature-grid">${features.map((f) => `<div class="feature"><h3>${esc(f.h)}</h3><p>${esc(f.p)}</p></div>`).join('')}</div>
        </section>
        ${(t.article || []).map((a) => `<section><h2>${esc(a.h)}</h2>${a.p.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}
        ${t.faq?.length ? `<section class="faq"><h2>Frequently asked questions</h2>${t.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</section>` : ''}
        ${relatedAll.length ? `<section><h2>Related tools</h2><div class="related">${relatedAll.map((r) => `<a href="../${r.slug}/">${icon(r.icon)}${esc(r.name)}</a>`).join('')}</div></section>` : ''}
        ${adSlot('bottom')}
      </div>
    </div>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t.h1 || t.name,
      url,
      description: t.description,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (runs in web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: t.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to ${t.howTitle || t.name.toLowerCase()}`,
      step: t.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    },
  ];
  if (t.faq?.length)
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });

  write(path, layout({ path, title: t.title, description: t.description, body, jsonLd, footerGroups: footerGroups() }));
}

function homePage() {
  // Only the "main" tool of each family shows on the home grid; variants are linked from the tool pages.
  const featured = TOOLS.filter((t) => !t.hideOnHome);
  const cards = featured
    .map(
      (t) => `
        <a class="tool-card" href="${t.slug}/" data-cat="${t.category}" data-search="${esc(`${t.name} ${t.h1 || ''} ${t.keywords || ''}`.toLowerCase())}">
          <span class="ico">${icon(t.icon)}</span>
          ${t.badge ? `<span class="tag">${esc(t.badge)}</span>` : ''}
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.cardText || t.intro.split('. ')[0].replace(/\.$/, ''))}.</p>
        </a>`,
    )
    .join('');
  const chips = [{ id: 'all', label: 'All' }, ...CATEGORIES]
    .map((c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${esc(c.label)}</button>`)
    .join('');

  const faq = [
    { q: 'Is ImageResizePro really free?', a: 'Yes. Every tool is free to use with no sign-up, no watermark and no daily limits.' },
    { q: 'Are my images uploaded to a server?', a: 'No. All processing happens inside your web browser using your own device, so your photos never leave your computer or phone.' },
    { q: 'Which image formats are supported?', a: 'JPG/JPEG, PNG, WebP, GIF, BMP and AVIF as input (depending on your browser), and JPG, PNG, WebP, AVIF, BMP, ICO and PDF as output.' },
    { q: 'Does it work on mobile phones?', a: 'Yes. ImageResizePro is designed for phones first and works in Chrome, Safari, Firefox and Edge on Android and iPhone.' },
    { q: 'Can I process many images at once?', a: 'Most tools support batch processing — add as many images as you like and download them all together as a ZIP file.' },
  ];

  const body = `
    <section class="hero container">
      <h1>Free Online Image Tools to <span>Resize, Compress &amp; Convert</span></h1>
      <p class="lead">Reduce photo size in KB, resize for exam forms, convert JPG to PDF and more — fast, free and 100% private. Your files never leave your device.</p>
      <div class="search-wrap">
        ${icon('search')}
        <input id="tool-search" type="search" placeholder="Search tools… e.g. compress, jpg to pdf, 20kb" aria-label="Search tools" autocomplete="off" />
      </div>
      <div class="badges">
        <span class="badge">${icon('check')} No sign-up</span>
        <span class="badge">${icon('check')} No watermark</span>
        <span class="badge">${icon('check')} Files stay on your device</span>
        <span class="badge">${icon('check')} Works on mobile</span>
      </div>
    </section>
    <div class="container" id="all-tools">
      ${adSlot('top')}
      <div class="filters" role="group" aria-label="Filter tools">${chips}</div>
      <div class="tool-grid">${cards}<p class="empty-state hidden">No tool found. Try “compress”, “pdf” or “resize”.</p></div>
      <div class="content">
        <section>
          <h2>Why people choose ${esc(SITE.name)}</h2>
          <div class="feature-grid">${DEFAULT_FEATURES.map((f) => `<div class="feature"><h3>${esc(f.h)}</h3><p>${esc(f.p)}</p></div>`).join('')}</div>
        </section>
        ${adSlot('middle')}
        <section>
          <h2>All the image tools you need in one place</h2>
          <p>${esc(SITE.name)} brings together the everyday image jobs people search for most: <a href="compress-image/">compressing images</a> to a smaller file size, <a href="resize-image/">resizing photos</a> to exact pixels, <a href="image-to-pdf/">turning images into PDF</a>, <a href="image-converter/">converting between JPG, PNG and WebP</a>, and preparing <a href="photo-signature-resizer/">photos and signatures for online application forms</a>.</p>
          <p>Unlike most online converters, nothing is uploaded. The tools run on modern browser technology directly on your phone or computer, which makes them faster and keeps private documents — ID cards, certificates, personal photos — completely private.</p>
        </section>
        <section class="faq">
          <h2>Frequently asked questions</h2>
          ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
        </section>
        ${adSlot('bottom')}
      </div>
    </div>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: `${SITE.url}/`,
      description: SITE.tagline,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      url: `${SITE.url}/`,
      logo: `${SITE.url}/assets/img/icon-512.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  write(
    '/',
    layout({
      path: '/',
      title: `${SITE.name} – Free Online Image Resizer, Compressor & Converter`,
      description: 'Free online image tools: compress images to 20KB/50KB, resize photos, convert JPG to PDF, PNG to JPG and more. No upload, no sign-up, 100% private.',
      body,
      jsonLd,
      footerGroups: footerGroups(),
    }),
  );
}

function staticPage(p) {
  const path = `/${p.slug}/`;
  const body = `
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="../">Home</a></li><li>${esc(p.h1)}</li></ol></nav>
      <article class="prose">
        <h1>${esc(p.h1)}</h1>
        ${p.html}
      </article>
    </div>`;
  write(path, layout({ path, title: p.title, description: p.description, body, footerGroups: footerGroups() }));
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const prio = (p) => (p === '/' ? '1.0' : STATIC_PAGES.some((s) => `/${s.slug}/` === p) ? '0.3' : '0.8');
  const urls = written
    .map((p) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${prio(p)}</priority></url>`)
    .join('\n');
  writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /scripts/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
}

function notFound() {
  const body = `
    <div class="container" style="text-align:center;padding:80px 16px">
      <h1>Page not found</h1>
      <p class="muted">The page you are looking for doesn’t exist or was moved.</p>
      <p><a class="btn btn-primary" href="/">Go to all tools</a></p>
    </div>`;
  // 404.html is served from any depth, so use root-absolute asset paths.
  const html = layout({ path: '/', title: `Page not found – ${SITE.name}`, description: 'Page not found.', body, footerGroups: footerGroups() })
    .replace('<meta name="robots" content="index, follow, max-image-preview:large" />', '<meta name="robots" content="noindex" />')
    .replace(/(href|src)="\.\//g, '$1="/');
  writeFileSync(join(ROOT, '404.html'), html);
}

function build() {
  homePage();
  TOOLS.forEach(toolPage);
  STATIC_PAGES.forEach(staticPage);
  sitemap();
  notFound();
  console.log(`Built ${written.length} pages + sitemap.xml, robots.txt, 404.html`);
}

build();
