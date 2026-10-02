// Photo filters & adjustments: brightness, contrast, saturation, blur, B&W, sepia… with live preview.
import { createBatchTool } from '../core/batch.js';
import { slider, segmented, advanced } from '../core/controls.js';
import { html, renameExt, debounce } from '../core/utils.js';
import { loadImage, createCanvas, canvasToBlob, canEncode, EXT_FOR_MIME, fitWithin } from '../core/image.js';

const LOOKS = {
  none: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, blur: 0, hue: 0, invert: 0 },
  bw: { brightness: 105, contrast: 115, saturate: 100, grayscale: 100, sepia: 0, blur: 0, hue: 0, invert: 0 },
  vintage: { brightness: 105, contrast: 90, saturate: 80, grayscale: 0, sepia: 45, blur: 0, hue: 0, invert: 0 },
  vivid: { brightness: 105, contrast: 115, saturate: 150, grayscale: 0, sepia: 0, blur: 0, hue: 0, invert: 0 },
  warm: { brightness: 105, contrast: 100, saturate: 120, grayscale: 0, sepia: 20, blur: 0, hue: -10, invert: 0 },
  cool: { brightness: 100, contrast: 105, saturate: 90, grayscale: 0, sepia: 0, blur: 0, hue: 15, invert: 0 },
  dramatic: { brightness: 95, contrast: 140, saturate: 70, grayscale: 0, sepia: 0, blur: 0, hue: 0, invert: 0 },
};

export const supportsCanvasFilter = () => typeof createCanvas(1, 1).getContext('2d').filter === 'string';

export function filterString(f) {
  return [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturate}%)`,
    `grayscale(${f.grayscale}%)`,
    `sepia(${f.sepia}%)`,
    `hue-rotate(${f.hue}deg)`,
    `invert(${f.invert}%)`,
    f.blur ? `blur(${f.blur}px)` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Pixel fallback for browsers without ctx.filter (older Safari). Blur and hue are skipped. */
function applyPixels(ctx, w, h, f) {
  const d = ctx.getImageData(0, 0, w, h);
  const p = d.data;
  const b = f.brightness / 100;
  const c = f.contrast / 100;
  const s = f.saturate / 100;
  const g = f.grayscale / 100;
  const se = f.sepia / 100;
  const inv = f.invert / 100;
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i] * b;
    let gr = p[i + 1] * b;
    let bl = p[i + 2] * b;
    r = (r - 128) * c + 128;
    gr = (gr - 128) * c + 128;
    bl = (bl - 128) * c + 128;
    const l = 0.2126 * r + 0.7152 * gr + 0.0722 * bl;
    const ss = s * (1 - g);
    r = l + (r - l) * ss;
    gr = l + (gr - l) * ss;
    bl = l + (bl - l) * ss;
    if (se) {
      const sr = 0.393 * r + 0.769 * gr + 0.189 * bl;
      const sg = 0.349 * r + 0.686 * gr + 0.168 * bl;
      const sb = 0.272 * r + 0.534 * gr + 0.131 * bl;
      r += (sr - r) * se;
      gr += (sg - gr) * se;
      bl += (sb - bl) * se;
    }
    if (inv) {
      r += (255 - 2 * r) * inv;
      gr += (255 - 2 * gr) * inv;
      bl += (255 - 2 * bl) * inv;
    }
    p[i] = r;
    p[i + 1] = gr;
    p[i + 2] = bl;
  }
  ctx.putImageData(d, 0, 0);
}

export function renderFiltered(img, f, w = img.naturalWidth, h = img.naturalHeight, background) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  if (supportsCanvasFilter()) {
    ctx.filter = filterString(f);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = 'none';
  } else {
    ctx.drawImage(img, 0, 0, w, h);
    applyPixels(ctx, w, h, f);
  }
  return c;
}

export default function mount(root, preset = {}) {
  let previewImg = null;
  let get = () => LOOKS.none;
  const preview = html('<div class="preview-box" style="min-height:200px;margin-bottom:4px"><canvas></canvas></div>');
  const pc = preview.querySelector('canvas');

  const redraw = debounce(() => {
    if (!previewImg) return;
    const { width, height } = fitWithin(previewImg.naturalWidth, previewImg.naturalHeight, 560, 360);
    const out = renderFiltered(previewImg, get(), width, height);
    pc.width = width;
    pc.height = height;
    pc.getContext('2d').drawImage(out, 0, 0);
  }, 30);

  createBatchTool(root, {
    actionLabel: 'Apply to all images',
    zipName: 'edited-images.zip',
    renderOptions(panel, ctx) {
      panel.appendChild(html('<h3>Filters</h3>'));
      const look = segmented(
        'Quick look',
        [
          { value: 'none', label: 'Original' },
          { value: 'bw', label: 'B&W' },
          { value: 'vintage', label: 'Vintage' },
          { value: 'vivid', label: 'Vivid' },
          { value: 'warm', label: 'Warm' },
          { value: 'cool', label: 'Cool' },
          { value: 'dramatic', label: 'Drama' },
        ],
        preset.look || 'none',
        (v) => {
          const l = LOOKS[v];
          Object.entries(sliders).forEach(([k, s]) => s.set(l[k]));
          redraw();
          ctx.invalidate();
        },
      );
      const start = LOOKS[preset.look || 'none'];
      const mk = (label, key, min, max, unit) => slider(label, { min, max, value: start[key], unit }, () => {
        redraw();
      });
      const sliders = {
        brightness: mk('Brightness', 'brightness', 0, 200, '%'),
        contrast: mk('Contrast', 'contrast', 0, 200, '%'),
        saturate: mk('Saturation', 'saturate', 0, 300, '%'),
        grayscale: mk('Black & white', 'grayscale', 0, 100, '%'),
        sepia: mk('Sepia', 'sepia', 0, 100, '%'),
        blur: mk('Blur', 'blur', 0, 20, 'px'),
        hue: mk('Hue', 'hue', -180, 180, '°'),
        invert: mk('Invert', 'invert', 0, 100, '%'),
      };
      const adv = advanced('More adjustments');
      adv.body.append(sliders.sepia.el, sliders.blur.el, sliders.hue.el, sliders.invert.el);
      panel.append(preview, look.el, sliders.brightness.el, sliders.contrast.el, sliders.saturate.el, sliders.grayscale.el, adv.el);
      get = () => Object.fromEntries(Object.entries(sliders).map(([k, s]) => [k, s.get()]));
      return get;
    },
    async onFilesChanged(items) {
      if (!items.length) return;
      previewImg = await loadImage(items[0].file);
      redraw();
    },
    async process(file, f) {
      const img = await loadImage(file);
      const mime = canEncode(file.type) ? file.type : 'image/png';
      const c = renderFiltered(img, f, img.naturalWidth, img.naturalHeight, mime === 'image/jpeg' ? '#fff' : null);
      const blob = await canvasToBlob(c, mime, 0.92);
      return { blob, name: renameExt(file.name.replace(/(\.[^.]+)?$/, '-edited$1'), EXT_FOR_MIME[mime]) };
    },
  });
}
