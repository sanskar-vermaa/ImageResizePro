// Favicon Generator: one image -> favicon.ico + PNG icons + web manifest + HTML snippet, as a ZIP.
import { html, escapeHtml } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { textField, colorField, segmented } from '../core/controls.js';
import { loadImage, createCanvas, canvasToBlob } from '../core/image.js';
import { imageToIco } from '../core/encoders.js';
import { loadJSZip } from '../core/libs.js';
import { downloadBlob } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

const PNGS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180, pad: true },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

const SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

function squareIcon(img, size, { bg, radius = 0, padding = 0 }) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  if (bg) {
    ctx.fillStyle = bg;
    if (radius) {
      const r = size * radius;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, r);
      ctx.fill();
      ctx.clip();
    } else ctx.fillRect(0, 0, size, size);
  }
  const inner = size * (1 - padding * 2);
  const s = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return c;
}

export default function mount(root) {
  root.innerHTML = '';
  let img = null;
  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="preview-box" style="min-height:220px;gap:18px;display:flex;flex-wrap:wrap;align-items:end;justify-content:center;padding:20px"></div>
        <h3 style="margin-top:18px">HTML code for your &lt;head&gt;</h3>
        <pre style="background:var(--surface-2);padding:14px;border-radius:12px;overflow:auto;font-size:.8rem"><code>${escapeHtml(SNIPPET)}</code></pre>
      </div>
      <aside class="panel">
        <h3>Favicon settings</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.download} Download favicon package</button>
        <button type="button" class="btn btn-secondary btn-sm" data-act="change">${icons.refresh} Change image</button>
      </aside>
    </div>`);
  root.append(dzHost, main);
  const pv = main.querySelector('.preview-box');

  const appName = textField('Website name', { value: 'My Website' });
  const bgMode = segmented('Background', [{ value: 'none', label: 'Transparent' }, { value: 'color', label: 'Colour' }], 'none', draw);
  const bg = colorField('Background colour', '#4f46e5', draw);
  const shape = segmented('Shape', [{ value: '0', label: 'Square' }, { value: '0.22', label: 'Rounded' }, { value: '0.5', label: 'Circle' }], '0.22', draw);
  main.querySelector('.opts').append(appName.el, bgMode.el, bg.el, shape.el);

  const opts = () => ({ bg: bgMode.get() === 'color' ? bg.get() : null, radius: Number(shape.get()), padding: bgMode.get() === 'color' ? 0.12 : 0 });

  function draw() {
    if (!img) return;
    bg.el.classList.toggle('hidden', bgMode.get() !== 'color');
    pv.innerHTML = '';
    [16, 32, 48, 180].forEach((s) => {
      const c = squareIcon(img, s, opts());
      c.style.width = `${Math.max(s, 32)}px`;
      c.style.height = `${Math.max(s, 32)}px`;
      c.style.imageRendering = s < 32 ? 'pixelated' : 'auto';
      const fig = html(`<figure style="margin:0;text-align:center"><figcaption class="muted" style="font-size:.75rem">${s}×${s}</figcaption></figure>`);
      fig.prepend(c);
      pv.appendChild(fig);
    });
  }

  main.querySelector('[data-act=run]').onclick = async () => {
    if (!img) return;
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      const o = opts();
      for (const p of PNGS) {
        const c = squareIcon(img, p.size, p.pad && !o.bg ? { ...o, bg: '#ffffff', padding: 0.1 } : o);
        zip.file(p.name, await canvasToBlob(c, 'image/png'));
      }
      const icoSrc = squareIcon(img, 256, o);
      zip.file('favicon.ico', await imageToIco(icoSrc, [16, 32, 48]));
      const name = appName.get() || 'My Website';
      zip.file(
        'site.webmanifest',
        JSON.stringify(
          {
            name,
            short_name: name.slice(0, 12),
            icons: [
              { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
            theme_color: o.bg || '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
          },
          null,
          2,
        ),
      );
      zip.file('favicon-html-snippet.txt', SNIPPET);
      downloadBlob(await zip.generateAsync({ type: 'blob' }), 'favicon-package.zip');
      toastSuccess('Favicon package downloaded!');
    } catch (e) {
      console.error(e);
      toastError(e.message);
    }
  };

  async function setFile([f]) {
    try {
      img = await loadImage(f);
      dzHost.classList.add('hidden');
      main.classList.remove('hidden');
      draw();
    } catch (e) {
      toastError(e.message);
    }
  }
  const dz = mountDropzone(dzHost, { multiple: false, onFiles: setFile, title: 'Drop your logo (square PNG works best)' });
  onPasteImages(setFile);
  main.querySelector('[data-act=change]').onclick = () => dz.open();
}
