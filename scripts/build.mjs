// Static site generator: writes one HTML page per tool + home, legal pages, sitemap and robots.txt.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './site.config.mjs';
import { layout, esc, adSlot } from './layout.mjs';
import { TOOLS, CATEGORIES } from './content/tools.mjs';
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

function build() {
  TOOLS.forEach(toolPage);
  console.log(`Built ${written.length} pages.`);
}

build();
