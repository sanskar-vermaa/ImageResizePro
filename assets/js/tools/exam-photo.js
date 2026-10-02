// Exam Photo & Signature Resizer: exact pixel size + KB range in one step,
// with drag-to-position, zoom and optional name/date strip.
import { html, formatBytes, clamp } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { selectField, numberField, slider, checkbox, textField, advanced, segmented } from '../core/controls.js';
import { loadImage, createCanvas, canvasToBlob } from '../core/image.js';
import { downloadBlob } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

export const EXAM_PRESETS = [
  { value: 'photo-cm', label: 'Photo 3.5×4.5 cm · 20–50 KB', w: 276, h: 354, min: 20, max: 50 },
  { value: 'photo-200', label: 'Photo 200×230 px · 20–50 KB', w: 200, h: 230, min: 20, max: 50 },
  { value: 'photo-sq', label: 'Square photo 350×350 px · 20–300 KB', w: 350, h: 350, min: 20, max: 300 },
  { value: 'passport', label: 'Passport / visa 600×600 px · ≤ 240 KB', w: 600, h: 600, min: 0, max: 240 },
  { value: 'sign-cm', label: 'Signature 4×2 cm · 10–20 KB', w: 316, h: 158, min: 10, max: 20 },
  { value: 'sign-140', label: 'Signature 140×60 px · 10–20 KB', w: 140, h: 60, min: 10, max: 20 },
  { value: 'thumb', label: 'Thumb impression 240×240 px · 20–50 KB', w: 240, h: 240, min: 20, max: 50 },
  { value: 'custom', label: 'Custom size', w: 300, h: 400, min: 10, max: 100 },
];

export default function mount(root, preset = {}) {
  root.innerHTML = '';
  let img = null;
  let fileName = 'photo';
  let zoom = 1;
  let off = { x: 0, y: 0 };
  let result = null;

  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="preview-box" style="min-height:380px">
          <canvas class="pv" style="cursor:grab;touch-action:none;box-shadow:var(--shadow);max-height:420px"></canvas>
        </div>
        <p class="muted" style="text-align:center;font-size:.85rem;margin:10px 0 0">Drag the photo to position it · use Zoom to fit the face</p>
        <div class="stat-line" style="justify-content:center;margin-top:10px"></div>
        <div class="actions">
          <button type="button" class="btn btn-secondary btn-sm" data-act="change">${icons.refresh} Change photo</button>
        </div>
      </div>
      <aside class="panel">
        <h3>Size requirement</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.zap} Resize &amp; download</button>
        <small class="muted">Always check the size rules in your official notification before uploading.</small>
      </aside>
    </div>`);
  root.append(dzHost, main);

  const pv = main.querySelector('.pv');
  const stat = main.querySelector('.stat-line');
  const opts = main.querySelector('.opts');

  const start = EXAM_PRESETS.find((p) => p.value === preset.preset) || EXAM_PRESETS[0];
  const presetSel = selectField('Preset', EXAM_PRESETS, start.value, (v) => applyPreset(v));
  const width = numberField('Width (px)', { value: start.w, min: 20 }, draw);
  const height = numberField('Height (px)', { value: start.h, min: 20 }, draw);
  const dims = html('<div class="row"></div>');
  dims.append(width.el, height.el);
  const minKB = numberField('Min KB', { value: start.min, min: 0 });
  const maxKB = numberField('Max KB', { value: start.max, min: 1 });
  const kb = html('<div class="row"></div>');
  kb.append(minKB.el, maxKB.el);
  const zoomS = slider('Zoom', { min: 100, max: 300, value: 100, unit: '%' }, (v) => {
    zoom = v / 100;
    draw();
  });

  const adv = advanced('Name & date / more options');
  const fit = segmented(
    'Fit',
    [
      { value: 'cover', label: 'Fill (crop)' },
      { value: 'contain', label: 'Fit (white border)' },
    ],
    'cover',
    draw,
  );
  const strip = checkbox('Add name & date below photo', false, draw);
  const nameT = textField('Name', { placeholder: 'YOUR NAME' }, draw);
  const dateT = textField('Date', { value: new Date().toLocaleDateString('en-GB') }, draw);
  const gray = checkbox('Black & white', false, draw);
  adv.body.append(fit.el, strip.el, nameT.el, dateT.el, gray.el);
  opts.append(presetSel.el, dims, kb, zoomS.el, adv.el);

  function applyPreset(v) {
    const p = EXAM_PRESETS.find((x) => x.value === v);
    if (!p) return;
    width.set(p.w);
    height.set(p.h);
    minKB.set(p.min);
    maxKB.set(p.max);
    draw();
  }

  /** Render the final output canvas at the exact target size. */
  function render() {
    const W = clamp(width.get() || 200, 20, 4000);
    const H = clamp(height.get() || 200, 20, 4000);
    const c = createCanvas(W, H);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    if (!img) return c;
    const stripH = strip.get() ? Math.round(H * 0.18) : 0;
    const areaH = H - stripH;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const base = fit.get() === 'cover' ? Math.max(W / iw, areaH / ih) : Math.min(W / iw, areaH / ih);
    const s = base * zoom;
    const dw = iw * s;
    const dh = ih * s;
    // keep the image covering the frame when in cover mode
    const maxX = Math.max(0, (dw - W) / 2);
    const maxY = Math.max(0, (dh - areaH) / 2);
    off.x = clamp(off.x, -maxX, maxX);
    off.y = clamp(off.y, -maxY, maxY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, areaH);
    ctx.clip();
    ctx.imageSmoothingQuality = 'high';
    if (gray.get()) ctx.filter = 'grayscale(1)';
    ctx.drawImage(img, (W - dw) / 2 + off.x, (areaH - dh) / 2 + off.y, dw, dh);
    ctx.restore();
    if (stripH) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, areaH, W, stripH);
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fs = Math.max(8, Math.round(stripH * 0.36));
      ctx.font = `600 ${fs}px Arial, sans-serif`;
      ctx.fillText((nameT.get() || '').toUpperCase(), W / 2, areaH + stripH * 0.3, W - 6);
      ctx.font = `${Math.round(fs * 0.9)}px Arial, sans-serif`;
      ctx.fillText(dateT.get() || '', W / 2, areaH + stripH * 0.72, W - 6);
    }
    return c;
  }

  function draw() {
    if (!img) return;
    result = null;
    const c = render();
    pv.width = c.width;
    pv.height = c.height;
    // Show small outputs bigger on screen.
    const scale = Math.min(3, 380 / c.height);
    pv.style.width = `${Math.round(c.width * scale)}px`;
    pv.style.height = `${Math.round(c.height * scale)}px`;
    pv.style.imageRendering = scale > 1.5 ? 'auto' : '';
    pv.getContext('2d').drawImage(c, 0, 0);
    stat.innerHTML = `Output: <b>${c.width}×${c.height}px</b> · Target <b>${minKB.get() || 0}–${maxKB.get() || '∞'} KB</b> · JPG`;
  }

  // Drag to reposition
  let dragging = null;
  pv.addEventListener('pointerdown', (e) => {
    dragging = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
    pv.setPointerCapture(e.pointerId);
    pv.style.cursor = 'grabbing';
  });
  pv.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const k = pv.width / pv.getBoundingClientRect().width;
    off.x = dragging.ox + (e.clientX - dragging.x) * k;
    off.y = dragging.oy + (e.clientY - dragging.y) * k;
    draw();
  });
  const end = () => {
    dragging = null;
    pv.style.cursor = 'grab';
  };
  pv.addEventListener('pointerup', end);
  pv.addEventListener('pointercancel', end);

  /** Hit the KB window: binary-search JPEG quality. */
  async function encode() {
    const c = render();
    const min = (minKB.get() || 0) * 1024;
    const max = (maxKB.get() || 100000) * 1024;
    let lo = 0.05;
    let hi = 1;
    let best = null;
    for (let i = 0; i < 10; i++) {
      const q = (lo + hi) / 2;
      const b = await canvasToBlob(c, 'image/jpeg', q);
      if (b.size <= max) {
        best = b;
        lo = q;
      } else hi = q;
    }
    if (!best) best = await canvasToBlob(c, 'image/jpeg', 0.05);
    let note = '';
    if (best.size < min) {
      const top = await canvasToBlob(c, 'image/jpeg', 1);
      if (top.size <= max) best = top;
      if (best.size < min) {
        // Pad the JPEG with a comment segment so it meets the minimum size requirement.
        const bytes = new Uint8Array(await best.arrayBuffer());
        const need = Math.min(min - best.size + 64, 65000);
        const com = new Uint8Array(4 + need);
        com[0] = 0xff;
        com[1] = 0xfe;
        com[2] = ((need + 2) >> 8) & 0xff;
        com[3] = (need + 2) & 0xff;
        best = new Blob([bytes.slice(0, 2), com, bytes.slice(2)], { type: 'image/jpeg' });
        note = ' (padded to meet minimum size)';
      }
    }
    if (best.size > max) note = ' — could not reach max size, try a smaller width/height';
    return { blob: best, note };
  }

  main.querySelector('[data-act=run]').onclick = async () => {
    if (!img) return;
    try {
      result = await encode();
      const name = `${fileName}-${width.get()}x${height.get()}.jpg`;
      downloadBlob(result.blob, name);
      stat.innerHTML += ` · Final: <b>${formatBytes(result.blob.size)}</b>${result.note}`;
      toastSuccess(`Saved ${formatBytes(result.blob.size)} JPG`);
    } catch (e) {
      toastError(e.message);
    }
  };

  async function setFile([f]) {
    try {
      img = await loadImage(f);
      fileName = f.name.replace(/\.[^.]+$/, '') || 'photo';
      off = { x: 0, y: 0 };
      zoom = 1;
      zoomS.set(100);
      dzHost.classList.add('hidden');
      main.classList.remove('hidden');
      draw();
    } catch (e) {
      toastError(e.message);
    }
  }
  const dz = mountDropzone(dzHost, { multiple: false, onFiles: setFile, title: 'Upload your photo or signature' });
  onPasteImages(setFile);
  main.querySelector('[data-act=change]').onclick = () => dz.open();
}
