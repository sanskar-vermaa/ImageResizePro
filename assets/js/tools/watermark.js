// Watermark: add text (or a logo) to many images at once.
import { createBatchTool } from '../core/batch.js';
import { textField, slider, selectField, colorField, checkbox, advanced } from '../core/controls.js';
import { html, renameExt } from '../core/utils.js';
import { loadImage, imageToCanvas, createCanvas, canvasToBlob, canEncode, EXT_FOR_MIME } from '../core/image.js';

const POSITIONS = [
  { value: 'br', label: 'Bottom right' },
  { value: 'bl', label: 'Bottom left' },
  { value: 'tr', label: 'Top right' },
  { value: 'tl', label: 'Top left' },
  { value: 'c', label: 'Centre' },
  { value: 'tile', label: 'Repeat across image' },
];

function anchor(pos, W, H, w, h, pad) {
  const x = pos.includes('l') ? pad : pos.includes('r') ? W - w - pad : (W - w) / 2;
  const y = pos.includes('t') ? pad : pos.includes('b') ? H - h - pad : (H - h) / 2;
  return { x, y };
}

export default function mount(root) {
  let logo = null;
  createBatchTool(root, {
    actionLabel: 'Add watermark',
    zipName: 'watermarked-images.zip',
    renderOptions(panel) {
      panel.appendChild(html('<h3>Watermark</h3>'));
      const text = textField('Text', { value: '© My Brand' });
      const size = slider('Size', { min: 2, max: 20, value: 6, unit: '%' });
      const opacity = slider('Opacity', { min: 10, max: 100, value: 60, unit: '%' });
      const pos = selectField('Position', POSITIONS, 'br');
      const adv = advanced();
      const color = colorField('Text colour', '#ffffff');
      const shadow = checkbox('Text shadow (better on light photos)', true);
      const logoField = html(`<div class="field"><label>Logo image (optional)</label><input type="file" accept="image/*" class="input" /></div>`);
      logoField.querySelector('input').addEventListener('change', async (e) => {
        const f = e.target.files[0];
        logo = f ? await loadImage(f) : null;
      });
      adv.body.append(color.el, shadow.el, logoField);
      panel.append(text.el, size.el, opacity.el, pos.el, adv.el);
      return () => ({
        text: text.get(),
        size: size.get() / 100,
        opacity: opacity.get() / 100,
        pos: pos.get(),
        color: color.get(),
        shadow: shadow.get(),
      });
    },
    async process(file, o) {
      const img = await loadImage(file);
      const mime = canEncode(file.type) ? file.type : 'image/png';
      const c = imageToCanvas(img, { background: mime === 'image/jpeg' ? '#fff' : null });
      const ctx = c.getContext('2d');
      const W = c.width;
      const H = c.height;
      const unit = Math.min(W, H);
      const pad = Math.round(unit * 0.03);
      ctx.globalAlpha = o.opacity;

      // Build the mark (logo, text, or both) on its own canvas so we can place/tile it.
      const fs = Math.max(10, Math.round(unit * o.size));
      ctx.font = `700 ${fs}px Inter, Arial, sans-serif`;
      const tw = o.text ? ctx.measureText(o.text).width : 0;
      const lh = logo ? fs * 1.6 : 0;
      const lw = logo ? (logo.naturalWidth / logo.naturalHeight) * lh : 0;
      const gap = logo && o.text ? fs * 0.4 : 0;
      const mw = Math.ceil(lw + gap + tw + 8);
      const mh = Math.ceil(Math.max(lh, fs * 1.3) + 8);
      const mark = createCanvas(mw, mh);
      const m = mark.getContext('2d');
      if (logo) m.drawImage(logo, 4, (mh - lh) / 2, lw, lh);
      if (o.text) {
        m.font = ctx.font;
        m.textBaseline = 'middle';
        m.fillStyle = o.color;
        if (o.shadow) {
          m.shadowColor = 'rgba(0,0,0,.55)';
          m.shadowBlur = fs * 0.15;
          m.shadowOffsetY = fs * 0.05;
        }
        m.fillText(o.text, 4 + lw + gap, mh / 2);
      }

      if (o.pos === 'tile') {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        const stepX = mw * 1.8;
        const stepY = mh * 3;
        const R = Math.hypot(W, H);
        for (let y = -R; y < R; y += stepY) {
          for (let x = -R; x < R; x += stepX) ctx.drawImage(mark, x + ((y / stepY) % 2 ? stepX / 2 : 0), y);
        }
        ctx.restore();
      } else {
        const { x, y } = anchor(o.pos, W, H, mw, mh, pad);
        ctx.drawImage(mark, x, y);
      }
      ctx.globalAlpha = 1;
      const blob = await canvasToBlob(c, mime, 0.92);
      return { blob, name: renameExt(file.name.replace(/(\.[^.]+)?$/, '-watermarked$1'), EXT_FOR_MIME[mime]) };
    },
  });
}
