// Remove EXIF / metadata (GPS location, camera info) from photos — losslessly for JPG and PNG.
import { createBatchTool } from '../core/batch.js';
import { html, escapeHtml } from '../core/utils.js';
import { readExif, stripJpeg, stripPng } from '../core/exif.js';
import { loadImage, imageToCanvas, canvasToBlob, canEncode } from '../core/image.js';

export default function mount(root) {
  const info = html('<div class="exif-info" style="font-size:.85rem"><p class="muted" style="margin:0">Metadata found in your first photo will appear here.</p></div>');

  createBatchTool(root, {
    actionLabel: 'Remove metadata',
    zipName: 'clean-images.zip',
    renderOptions(panel) {
      panel.append(
        html('<h3>Metadata</h3>'),
        info,
        html('<small class="muted">JPG and PNG are cleaned losslessly — the picture itself is not re-compressed.</small>'),
      );
      return () => ({});
    },
    async onFilesChanged(items) {
      if (!items.length) return;
      const f = items[0].file;
      const tags = readExif(await f.arrayBuffer());
      const keys = Object.keys(tags);
      info.innerHTML = keys.length
        ? `<p style="margin:0 0 6px"><b>${escapeHtml(f.name)}</b> contains:</p><table style="width:100%;border-collapse:collapse">${keys
            .map(
              (k) =>
                `<tr><td class="muted" style="padding:3px 6px 3px 0;vertical-align:top">${escapeHtml(k)}</td><td style="padding:3px 0;word-break:break-word;${k === 'Location' ? 'color:var(--danger);font-weight:700' : ''}">${escapeHtml(String(tags[k]))}</td></tr>`,
            )
            .join('')}</table>`
        : `<p style="margin:0"><b>${escapeHtml(f.name)}</b>: no EXIF data found.</p>`;
    },
    async process(file) {
      const buf = await file.arrayBuffer();
      const had = Object.keys(readExif(buf));
      let blob = null;
      if (file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)) blob = stripJpeg(buf);
      else if (file.type === 'image/png') blob = stripPng(buf);
      if (!blob) {
        const img = await loadImage(file);
        const mime = canEncode(file.type) ? file.type : 'image/png';
        blob = await canvasToBlob(imageToCanvas(img), mime, 0.95);
      }
      const note = had.includes('Location') ? 'GPS location removed' : had.length ? `${had.length} tags removed` : 'cleaned';
      return { blob, name: file.name.replace(/(\.[^.]+)?$/, '-clean$1'), note };
    },
  });
}
