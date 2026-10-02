// Image Resizer: by pixels, by percentage, or by preset (social media sizes).
import { createBatchTool } from '../core/batch.js';
import { segmented, slider, numberField, checkbox, selectField, colorField, advanced } from '../core/controls.js';
import { html, renameExt } from '../core/utils.js';
import { loadImage, createCanvas, canvasToBlob, canEncode, MIME, EXT_FOR_MIME } from '../core/image.js';

export const PRESETS = [
  { value: '', label: 'Custom size' },
  { value: '1080x1080', label: 'Instagram post (1080×1080)' },
  { value: '1080x1350', label: 'Instagram portrait (1080×1350)' },
  { value: '1080x1920', label: 'Instagram / WhatsApp story (1080×1920)' },
  { value: '1280x720', label: 'YouTube thumbnail (1280×720)' },
  { value: '2560x1440', label: 'YouTube banner (2560×1440)' },
  { value: '1200x630', label: 'Facebook / OG share (1200×630)' },
  { value: '820x312', label: 'Facebook cover (820×312)' },
  { value: '1584x396', label: 'LinkedIn banner (1584×396)' },
  { value: '400x400', label: 'Profile picture (400×400)' },
  { value: '1500x500', label: 'X / Twitter header (1500×500)' },
  { value: '1920x1080', label: 'Full HD wallpaper (1920×1080)' },
];

/** Compute output size + draw rect for each fit mode. */
export function computeResize(sw, sh, o) {
  let tw;
  let th;
  if (o.mode === 'percent') {
    tw = Math.round((sw * o.percent) / 100);
    th = Math.round((sh * o.percent) / 100);
    return { cw: tw, ch: th, dx: 0, dy: 0, dw: tw, dh: th };
  }
  tw = o.width;
  th = o.height;
  if (!tw && !th) return { cw: sw, ch: sh, dx: 0, dy: 0, dw: sw, dh: sh };
  if (o.keepRatio || !tw || !th) {
    if (tw && !th) th = Math.round((sh * tw) / sw);
    else if (th && !tw) tw = Math.round((sw * th) / sh);
    else if (o.fit === 'stretch' || !o.fit) {
      // keep ratio: fit within the box
      const r = Math.min(tw / sw, th / sh);
      tw = Math.round(sw * r);
      th = Math.round(sh * r);
    }
  }
  if (o.fit === 'contain' && o.width && o.height) {
    const r = Math.min(o.width / sw, o.height / sh);
    const dw = Math.round(sw * r);
    const dh = Math.round(sh * r);
    return { cw: o.width, ch: o.height, dx: Math.round((o.width - dw) / 2), dy: Math.round((o.height - dh) / 2), dw, dh };
  }
  if (o.fit === 'cover' && o.width && o.height) {
    const r = Math.max(o.width / sw, o.height / sh);
    const dw = Math.round(sw * r);
    const dh = Math.round(sh * r);
    return { cw: o.width, ch: o.height, dx: Math.round((o.width - dw) / 2), dy: Math.round((o.height - dh) / 2), dw, dh };
  }
  return { cw: tw, ch: th, dx: 0, dy: 0, dw: tw, dh: th };
}

export default function mount(root, preset = {}) {
  createBatchTool(root, {
    actionLabel: 'Resize images',
    zipName: 'resized-images.zip',
    renderOptions(panel, ctx) {
      panel.appendChild(html('<h3>Resize settings</h3>'));
      const mode = segmented(
        'Resize by',
        [
          { value: 'pixels', label: 'Pixels' },
          { value: 'percent', label: 'Percentage' },
        ],
        preset.mode || 'pixels',
        (v) => toggle(v),
      );
      const presetSel = selectField('Preset', PRESETS, preset.preset || '', (v) => {
        if (!v) return;
        const [w, h] = v.split('x').map(Number);
        width.set(w);
        height.set(h);
        lock.set(false);
        fit.set('cover');
      });
      const width = numberField('Width (px)', { value: preset.width ?? '', min: 1, placeholder: 'auto' }, (v) => syncFrom('w', v));
      const height = numberField('Height (px)', { value: preset.height ?? '', min: 1, placeholder: 'auto' }, (v) => syncFrom('h', v));
      const row = html('<div class="row"></div>');
      row.append(width.el, height.el);
      const lock = checkbox('Keep aspect ratio', preset.keepRatio ?? true);
      const percent = slider('Scale', { min: 5, max: 200, value: preset.percent || 50, unit: '%' });

      const adv = advanced();
      const fit = selectField(
        'When both sides are set',
        [
          { value: 'stretch', label: 'Fit inside (no crop)' },
          { value: 'cover', label: 'Fill & crop to exact size' },
          { value: 'contain', label: 'Fit & pad with background' },
        ],
        preset.fit || 'stretch',
      );
      const bg = colorField('Padding background', '#ffffff');
      const format = segmented('Output format', [{ value: 'same', label: 'Same' }, 'jpg', 'png', 'webp'], preset.format || 'same');
      const quality = slider('Quality (JPG/WEBP)', { min: 40, max: 100, value: 92, unit: '%' });
      adv.body.append(fit.el, bg.el, format.el, quality.el);

      panel.append(mode.el, presetSel.el, row, lock.el, percent.el, adv.el);

      function first() {
        return ctx.items[0]?.dims;
      }
      function syncFrom(which, v) {
        const d = first();
        if (!lock.get() || !d || !v) return;
        if (which === 'w') height.set(Math.round((d.h * v) / d.w));
        else width.set(Math.round((d.w * v) / d.h));
      }
      function toggle(v) {
        [presetSel.el, row, lock.el].forEach((e) => e.classList.toggle('hidden', v !== 'pixels'));
        percent.el.classList.toggle('hidden', v !== 'percent');
      }
      toggle(mode.get());

      return () => ({
        mode: mode.get(),
        width: width.get(),
        height: height.get(),
        keepRatio: lock.get(),
        percent: percent.get(),
        fit: fit.get(),
        bg: bg.get(),
        format: format.get(),
        quality: quality.get() / 100,
      });
    },

    async onFilesChanged(items) {
      // Remember each image's dimensions so the aspect lock can fill the other box.
      for (const it of items) {
        if (!it.dims) {
          try {
            const img = await loadImage(it.file);
            it.dims = { w: img.naturalWidth, h: img.naturalHeight };
            URL.revokeObjectURL(img._objectUrl);
          } catch {
            /* ignored */
          }
        }
      }
    },

    async process(file, o) {
      const img = await loadImage(file);
      const sw = img.naturalWidth;
      const sh = img.naturalHeight;
      const r = computeResize(sw, sh, o);
      if (r.cw > 16384 || r.ch > 16384) throw new Error('Too large (max 16384px)');
      let mime = o.format === 'same' ? file.type : MIME[o.format];
      if (!mime || !canEncode(mime)) mime = 'image/png';
      const canvas = createCanvas(r.cw, r.ch);
      const c = canvas.getContext('2d');
      c.imageSmoothingQuality = 'high';
      if (mime === 'image/jpeg' || o.fit === 'contain') {
        c.fillStyle = o.fit === 'contain' ? o.bg : '#ffffff';
        c.fillRect(0, 0, r.cw, r.ch);
      }
      c.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      const blob = await canvasToBlob(canvas, mime, o.quality);
      return { blob, name: renameExt(file.name, EXT_FOR_MIME[mime]), note: `${sw}×${sh} → ${r.cw}×${r.ch}` };
    },
  });
}
