// Merge / combine images side by side, stacked, or in a grid.
import { html, escapeHtml } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { segmented, slider, colorField, advanced } from '../core/controls.js';
import { loadImage, createCanvas, canvasToBlob, fitWithin } from '../core/image.js';
import { downloadBlob } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

/** Lay out images and return { width, height, rects } */
export function layoutImages(sizes, { dir, gap, cols }) {
  const rects = [];
  if (dir === 'h') {
    const H = Math.min(...sizes.map((s) => s.h));
    let x = 0;
    sizes.forEach((s) => {
      const w = Math.round((s.w * H) / s.h);
      rects.push({ x, y: 0, w, h: H });
      x += w + gap;
    });
    return { width: x - gap, height: H, rects };
  }
  if (dir === 'v') {
    const W = Math.min(...sizes.map((s) => s.w));
    let y = 0;
    sizes.forEach((s) => {
      const h = Math.round((s.h * W) / s.w);
      rects.push({ x: 0, y, w: W, h });
      y += h + gap;
    });
    return { width: W, height: y - gap, rects };
  }
  // grid: equal cells sized to the smallest width, cell height from average aspect
  const cw = Math.min(...sizes.map((s) => s.w));
  const avgAspect = sizes.reduce((n, s) => n + s.h / s.w, 0) / sizes.length;
  const ch = Math.round(cw * avgAspect);
  const rows = Math.ceil(sizes.length / cols);
  sizes.forEach((s, i) => {
    const { width: w, height: h } = fitWithin(s.w, s.h, cw, ch);
    const col = i % cols;
    const row = Math.floor(i / cols);
    rects.push({ x: col * (cw + gap) + (cw - w) / 2, y: row * (ch + gap) + (ch - h) / 2, w, h });
  });
  return { width: cols * cw + (cols - 1) * gap, height: rows * ch + (rows - 1) * gap, rects };
}

export default function mount(root, preset = {}) {
  root.innerHTML = '';
  const imgs = [];
  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="preview-box" style="padding:12px"><canvas style="max-height:480px;box-shadow:var(--shadow)"></canvas></div>
        <div class="thumbs" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"></div>
        <div class="actions" style="justify-content:flex-start">
          <button type="button" class="btn btn-secondary btn-sm" data-act="add">${icons.plus} Add images</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="clear">${icons.trash} Clear</button>
        </div>
      </div>
      <aside class="panel">
        <h3>Layout</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.download} Download merged image</button>
        <div class="summary muted" style="text-align:center;font-size:.88rem"></div>
      </aside>
    </div>`);
  root.append(dzHost, main);
  const canvas = main.querySelector('canvas');
  const thumbs = main.querySelector('.thumbs');
  const summary = main.querySelector('.summary');

  const dir = segmented('Direction', [{ value: 'h', label: 'Side by side' }, { value: 'v', label: 'Stacked' }, { value: 'g', label: 'Grid' }], preset.dir || 'h', draw);
  const cols = slider('Grid columns', { min: 2, max: 6, value: 2 }, draw);
  const gap = slider('Spacing', { min: 0, max: 80, value: 10, unit: 'px' }, draw);
  const adv = advanced();
  const bg = colorField('Background', '#ffffff', draw);
  const fmt = segmented('Format', [{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }], 'jpg');
  const maxW = slider('Max output width', { min: 800, max: 8000, step: 100, value: 4000, unit: 'px' }, draw);
  adv.body.append(bg.el, fmt.el, maxW.el);
  main.querySelector('.opts').append(dir.el, cols.el, gap.el, adv.el);

  function render(full = true) {
    const sizes = imgs.map((i) => ({ w: i.img.naturalWidth, h: i.img.naturalHeight }));
    const L = layoutImages(sizes, { dir: dir.get(), gap: gap.get(), cols: cols.get() });
    let k = Math.min(1, maxW.get() / L.width);
    if (!full) k = Math.min(k, 900 / L.width, 900 / L.height);
    const c = createCanvas(L.width * k, L.height * k);
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg.get();
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.imageSmoothingQuality = 'high';
    L.rects.forEach((r, i) => ctx.drawImage(imgs[i].img, r.x * k, r.y * k, r.w * k, r.h * k));
    return c;
  }

  function draw() {
    cols.el.classList.toggle('hidden', dir.get() !== 'g');
    if (!imgs.length) return;
    const c = render(false);
    canvas.width = c.width;
    canvas.height = c.height;
    canvas.getContext('2d').drawImage(c, 0, 0);
    const full = render(true);
    summary.textContent = `Output: ${full.width}×${full.height}px`;
    thumbs.innerHTML = '';
    imgs.forEach((it, i) => {
      const t = html(`<div style="position:relative"><img src="${it.img.src}" alt="${escapeHtml(it.name)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"/>
        <button type="button" class="icon-btn" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px" aria-label="Remove">${icons.x}</button></div>`);
      t.querySelector('button').onclick = () => {
        imgs.splice(i, 1);
        if (!imgs.length) reset();
        else draw();
      };
      thumbs.appendChild(t);
    });
  }

  function reset() {
    imgs.length = 0;
    main.classList.add('hidden');
    dzHost.classList.remove('hidden');
  }

  async function add(files) {
    for (const f of files) {
      try {
        imgs.push({ img: await loadImage(f), name: f.name });
      } catch (e) {
        toastError(e.message);
      }
    }
    if (!imgs.length) return;
    dzHost.classList.add('hidden');
    main.classList.remove('hidden');
    draw();
  }

  main.querySelector('[data-act=run]').onclick = async () => {
    if (imgs.length < 2) return toastError('Add at least 2 images to merge.');
    const c = render(true);
    const png = fmt.get() === 'png';
    downloadBlob(await canvasToBlob(c, png ? 'image/png' : 'image/jpeg', 0.92), `merged-image.${png ? 'png' : 'jpg'}`);
    toastSuccess('Merged image downloaded');
  };
  const dz = mountDropzone(dzHost, { multiple: true, onFiles: add, title: 'Drop 2 or more images to combine' });
  onPasteImages(add);
  main.querySelector('[data-act=add]').onclick = () => dz.open();
  main.querySelector('[data-act=clear]').onclick = reset;
}
