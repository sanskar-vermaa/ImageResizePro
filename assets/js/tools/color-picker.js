// Color Picker from image + dominant colour palette.
import { html, escapeHtml } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { loadImage, imageToCanvas, fitWithin } from '../core/image.js';
import { toast, toastError } from '../core/toast.js';

const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Simple median-cut style palette: bucket by 4-bit colour, take most frequent distinct buckets. */
export function extractPalette(data, count = 8) {
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    b.n++;
    b.r += data[i];
    b.g += data[i + 1];
    b.b += data[i + 2];
    buckets.set(key, b);
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n).map((b) => [Math.round(b.r / b.n), Math.round(b.g / b.n), Math.round(b.b / b.n)]);
  const out = [];
  for (const c of sorted) {
    if (out.every((o) => Math.abs(o[0] - c[0]) + Math.abs(o[1] - c[1]) + Math.abs(o[2] - c[2]) > 60)) out.push(c);
    if (out.length >= count) break;
  }
  return out;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`Copied ${text}`);
  } catch {
    toastError('Copy failed — select the text and copy manually.');
  }
}

export default function mount(root) {
  root.innerHTML = '';
  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="preview-box"><canvas style="cursor:crosshair;max-width:100%"></canvas></div>
        <p class="muted" style="text-align:center;font-size:.85rem;margin-top:8px">Move over the image to preview · click to pick a colour</p>
      </div>
      <aside class="panel">
        <h3>Picked colour</h3>
        <div class="picked" style="display:flex;gap:12px;align-items:center">
          <div class="sw" style="width:64px;height:64px;border-radius:14px;border:1px solid var(--border);background:#fff"></div>
          <div class="codes" style="display:grid;gap:6px;font-family:ui-monospace,monospace;font-size:.9rem"></div>
        </div>
        <h3>Image palette</h3>
        <div class="palette" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
        <button type="button" class="btn btn-secondary btn-sm" data-act="change">${icons.refresh} Change image</button>
      </aside>
    </div>`);
  root.append(dzHost, main);
  const canvas = main.querySelector('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const sw = main.querySelector('.sw');
  const codes = main.querySelector('.codes');
  const palette = main.querySelector('.palette');

  function show(r, g, b) {
    const h = hex(r, g, b);
    sw.style.background = h;
    codes.innerHTML = '';
    [h, `rgb(${r}, ${g}, ${b})`, rgbToHsl(r, g, b)].forEach((v) => {
      const btn = html(`<button type="button" class="btn btn-secondary btn-sm" style="justify-content:space-between" title="Copy">${escapeHtml(v)}</button>`);
      btn.onclick = () => copy(v);
      codes.appendChild(btn);
    });
  }

  function at(e) {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * canvas.width);
    const y = Math.floor(((e.clientY - r.top) / r.height) * canvas.height);
    return ctx.getImageData(x, y, 1, 1).data;
  }
  let locked = false;
  canvas.addEventListener('pointermove', (e) => {
    if (locked) return;
    const d = at(e);
    show(d[0], d[1], d[2]);
  });
  canvas.addEventListener('click', (e) => {
    const d = at(e);
    show(d[0], d[1], d[2]);
    locked = true;
    copy(hex(d[0], d[1], d[2]));
    setTimeout(() => (locked = false), 1200);
  });

  async function setFile([f]) {
    try {
      const img = await loadImage(f);
      const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, 1200, 1200);
      const c = imageToCanvas(img, { width, height });
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(c, 0, 0);
      palette.innerHTML = '';
      extractPalette(ctx.getImageData(0, 0, width, height).data).forEach(([r, g, b]) => {
        const h = hex(r, g, b);
        const chip = html(`<button type="button" title="Copy ${h}" style="border:1px solid var(--border);border-radius:10px;height:54px;background:${h};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:3px"><span style="font-size:.65rem;background:rgba(255,255,255,.85);color:#000;border-radius:4px;padding:0 4px">${h}</span></button>`);
        chip.onclick = () => {
          show(r, g, b);
          copy(h);
        };
        palette.appendChild(chip);
      });
      const [r, g, b] = extractPalette(ctx.getImageData(0, 0, width, height).data, 1)[0] || [255, 255, 255];
      show(r, g, b);
      dzHost.classList.add('hidden');
      main.classList.remove('hidden');
    } catch (e) {
      toastError(e.message);
    }
  }
  const dz = mountDropzone(dzHost, { multiple: false, onFiles: setFile, title: 'Drop an image to pick colours from' });
  onPasteImages(setFile);
  main.querySelector('[data-act=change]').onclick = () => dz.open();
}
