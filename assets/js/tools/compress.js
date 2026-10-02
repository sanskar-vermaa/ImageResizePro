// Image Compressor: quality mode or exact target size (KB).
import { createBatchTool } from '../core/batch.js';
import { segmented, slider, numberField, checkbox, advanced } from '../core/controls.js';
import { html, renameExt } from '../core/utils.js';
import { loadImage, imageToCanvas, canvasToBlob, canEncode, MIME, EXT_FOR_MIME, fitWithin } from '../core/image.js';

/** Pick an output mime for "auto" mode. */
function autoMime(file) {
  if (file.type === 'image/jpeg') return 'image/jpeg';
  if ((file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif') && canEncode('image/webp')) return 'image/webp';
  return 'image/jpeg';
}

/** Binary-search JPEG/WebP quality so the result fits under targetBytes. */
async function compressToTarget(img, mime, targetBytes, background) {
  let { naturalWidth: w, naturalHeight: h } = img;
  for (let attempt = 0; attempt < 12; attempt++) {
    const canvas = imageToCanvas(img, { width: w, height: h, background });
    let lo = 0.05;
    let hi = 0.95;
    let best = null;
    for (let i = 0; i < 8; i++) {
      const q = (lo + hi) / 2;
      const blob = await canvasToBlob(canvas, mime, q);
      if (blob.size <= targetBytes) {
        best = { blob, q, w, h };
        lo = q;
      } else hi = q;
    }
    if (best) return best;
    // Even the lowest quality is too big: shrink dimensions and retry.
    w = Math.max(1, Math.round(w * 0.85));
    h = Math.max(1, Math.round(h * 0.85));
  }
  throw new Error('Could not reach that size');
}

export default function mount(root, preset = {}) {
  createBatchTool(root, {
    actionLabel: 'Compress images',
    zipName: 'compressed-images.zip',
    renderOptions(panel) {
      panel.appendChild(html('<h3>Compression settings</h3>'));
      const mode = segmented(
        'Mode',
        [
          { value: 'quality', label: 'By quality' },
          { value: 'target', label: 'Target size' },
        ],
        preset.targetKB ? 'target' : 'quality',
        (v) => toggle(v),
      );
      const quality = slider('Quality', { min: 10, max: 95, value: preset.quality || 75, unit: '%' });
      const target = numberField('Target size (KB)', { value: preset.targetKB || 100, min: 5, hint: 'Each image will be at or below this size.' });
      const format = segmented(
        'Output format',
        [
          { value: 'auto', label: 'Auto' },
          { value: 'jpg', label: 'JPG' },
          { value: 'webp', label: 'WEBP' },
          { value: 'png', label: 'PNG' },
        ],
        preset.format || 'auto',
      );
      const maxW = numberField('Max width (px, optional)', { placeholder: 'Keep original', min: 16 });
      const keepIfLarger = checkbox('Keep original if result is larger', true);

      const adv = advanced();
      adv.body.append(format.el, maxW.el, keepIfLarger.el);
      panel.append(mode.el, quality.el, target.el, adv.el);
      function toggle(v) {
        quality.el.classList.toggle('hidden', v !== 'quality');
        target.el.classList.toggle('hidden', v !== 'target');
      }
      toggle(mode.get());

      return () => ({
        mode: mode.get(),
        quality: quality.get() / 100,
        targetKB: target.get() || 100,
        format: format.get(),
        maxW: maxW.get(),
        keepIfLarger: keepIfLarger.get(),
      });
    },

    async process(file, o) {
      const img = await loadImage(file);
      let mime = o.format === 'auto' ? autoMime(file) : MIME[o.format];
      if (!canEncode(mime)) mime = 'image/jpeg';
      const background = mime === 'image/jpeg' ? '#ffffff' : null;
      const name = renameExt(file.name, EXT_FOR_MIME[mime]);

      let source = img;
      if (o.maxW && img.naturalWidth > o.maxW) {
        const size = fitWithin(img.naturalWidth, img.naturalHeight, o.maxW, Infinity);
        source = imageToCanvas(img, size);
        source.naturalWidth = source.width;
        source.naturalHeight = source.height;
      }

      if (o.mode === 'target') {
        const targetBytes = o.targetKB * 1024;
        if (file.size <= targetBytes && !o.maxW && file.type === mime) {
          return { blob: file, name: file.name, note: 'already under target' };
        }
        if (mime === 'image/png') mime = canEncode('image/webp') ? 'image/webp' : 'image/jpeg';
        const best = await compressToTarget(source, mime, targetBytes, mime === 'image/jpeg' ? '#ffffff' : null);
        const note = best.w !== (source.naturalWidth || source.width) ? `resized to ${best.w}×${best.h}` : `quality ${Math.round(best.q * 100)}%`;
        return { blob: best.blob, name: renameExt(file.name, EXT_FOR_MIME[mime]), note };
      }

      const canvas = imageToCanvas(source, { background });
      const blob = await canvasToBlob(canvas, mime, o.quality);
      if (o.keepIfLarger && blob.size >= file.size && file.type === mime) {
        return { blob: file, name: file.name, note: 'already optimised' };
      }
      return { blob, name };
    },
  });
}
