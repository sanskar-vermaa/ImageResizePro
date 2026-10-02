// Image Converter: JPG, PNG, WEBP, AVIF, BMP, ICO.
import { createBatchTool } from '../core/batch.js';
import { segmented, slider, colorField, advanced } from '../core/controls.js';
import { html, renameExt } from '../core/utils.js';
import { loadImage, imageToCanvas, canvasToBlob, canEncode, MIME } from '../core/image.js';
import { canvasToBmp, imageToIco } from '../core/encoders.js';

const FORMATS = ['jpg', 'png', 'webp', 'avif', 'bmp', 'ico'];

export default function mount(root, preset = {}) {
  const available = FORMATS.filter((f) => ['bmp', 'ico'].includes(f) || canEncode(MIME[f]));
  createBatchTool(root, {
    actionLabel: 'Convert images',
    zipName: 'converted-images.zip',
    renderOptions(panel) {
      panel.appendChild(html('<h3>Convert to</h3>'));
      const to = segmented(
        'Output format',
        available.map((f) => ({ value: f, label: f.toUpperCase() })),
        available.includes(preset.to) ? preset.to : 'jpg',
        () => toggle(),
      );
      const quality = slider('Quality', { min: 40, max: 100, value: 92, unit: '%' });
      const adv = advanced();
      const bg = colorField('Background for transparent areas (JPG/BMP)', '#ffffff');
      adv.body.append(bg.el);
      panel.append(to.el, quality.el, adv.el);
      if (!canEncode('image/avif'))
        panel.appendChild(html('<small class="muted">AVIF output is not supported by this browser — try Chrome for AVIF.</small>'));
      function toggle() {
        quality.el.classList.toggle('hidden', !['jpg', 'webp', 'avif'].includes(to.get()));
      }
      toggle();
      return () => ({ to: to.get(), quality: quality.get() / 100, bg: bg.get() });
    },

    async process(file, o) {
      const img = await loadImage(file);
      const name = renameExt(file.name, o.to);
      if (o.to === 'ico') return { blob: await imageToIco(img), name, note: '16–256px icon' };
      const flatten = o.to === 'jpg' || o.to === 'bmp';
      const canvas = imageToCanvas(img, { background: flatten ? o.bg : null });
      if (o.to === 'bmp') return { blob: canvasToBmp(canvas), name };
      return { blob: await canvasToBlob(canvas, MIME[o.to], o.quality), name };
    },
  });
}
