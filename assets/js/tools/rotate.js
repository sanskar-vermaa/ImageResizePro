// Rotate & Flip: batch rotate by 90/180/270 or any angle, flip horizontally/vertically.
import { createBatchTool } from '../core/batch.js';
import { segmented, slider, checkbox, colorField, advanced } from '../core/controls.js';
import { html } from '../core/utils.js';
import { loadImage, createCanvas, canvasToBlob, canEncode } from '../core/image.js';

export function rotatedSize(w, h, deg) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));
  return { w: Math.round(w * cos + h * sin), h: Math.round(w * sin + h * cos) };
}

export default function mount(root, preset = {}) {
  createBatchTool(root, {
    actionLabel: preset.flipOnly ? 'Flip images' : 'Rotate images',
    zipName: 'rotated-images.zip',
    renderOptions(panel) {
      panel.appendChild(html(`<h3>${preset.flipOnly ? 'Flip' : 'Rotate & flip'}</h3>`));
      const angle = segmented(
        'Rotate',
        [
          { value: 0, label: '0°' },
          { value: 90, label: '90° ↻' },
          { value: 180, label: '180°' },
          { value: 270, label: '90° ↺' },
        ],
        preset.angle ?? (preset.flipOnly ? 0 : 90),
      );
      const flipH = checkbox('Flip horizontally (mirror)', !!preset.flipH);
      const flipV = checkbox('Flip vertically', !!preset.flipV);
      const adv = advanced();
      const custom = slider('Custom angle', { min: -180, max: 180, value: 0, unit: '°' });
      const bg = colorField('Background (for custom angles)', '#ffffff');
      const transparent = checkbox('Transparent background (PNG)', false);
      adv.body.append(custom.el, bg.el, transparent.el);
      panel.append(angle.el, flipH.el, flipV.el, adv.el);
      return () => ({
        angle: Number(angle.get()) + custom.get(),
        flipH: flipH.get(),
        flipV: flipV.get(),
        bg: bg.get(),
        transparent: transparent.get(),
      });
    },
    async process(file, o) {
      const img = await loadImage(file);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const deg = ((o.angle % 360) + 360) % 360;
      const { w, h } = rotatedSize(iw, ih, deg);
      const c = createCanvas(w, h);
      const ctx = c.getContext('2d');
      let mime = canEncode(file.type) ? file.type : 'image/png';
      if (o.transparent) mime = 'image/png';
      if (deg % 90 !== 0 && !o.transparent) {
        ctx.fillStyle = o.bg;
        ctx.fillRect(0, 0, w, h);
      } else if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.translate(w / 2, h / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.scale(o.flipH ? -1 : 1, o.flipV ? -1 : 1);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -iw / 2, -ih / 2);
      const blob = await canvasToBlob(c, mime, 0.95);
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[mime] || 'png';
      const name = file.name.replace(/(\.[^.]+)?$/, `-rotated.${ext}`);
      return { blob, name, note: `${w}×${h}` };
    },
  });
}
