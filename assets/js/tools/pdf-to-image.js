// PDF to Image: render every PDF page to JPG or PNG.
import { html, formatBytes, escapeHtml } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone } from '../core/dropzone.js';
import { segmented, textField, advanced } from '../core/controls.js';
import { createCanvas, canvasToBlob } from '../core/image.js';
import { loadPdfJs } from '../core/libs.js';
import { downloadBlob, downloadZip } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

/** "1-3, 5" -> [1,2,3,5] (clamped to 1..max). Empty -> all pages. */
export function parseRange(str, max) {
  if (!str || !str.trim()) return Array.from({ length: max }, (_, i) => i + 1);
  const set = new Set();
  str.split(',').forEach((part) => {
    const [a, b] = part.split('-').map((x) => parseInt(x.trim(), 10));
    if (Number.isNaN(a)) return;
    const end = b === undefined || Number.isNaN(b) ? a : b;
    for (let i = Math.max(1, Math.min(a, end)); i <= Math.min(max, Math.max(a, end)); i++) set.add(i);
  });
  return [...set].sort((x, y) => x - y);
}

export default function mount(root, preset = {}) {
  root.innerHTML = '';
  let file = null;
  let results = [];

  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="file-list"><div class="file-item">
          <span class="ico" style="width:56px;height:56px;display:grid;place-items:center;color:var(--danger)">${icons.pdf}</span>
          <div class="meta"><div class="name"></div><div class="info"></div></div>
          <div class="ops"><button type="button" class="btn btn-ghost btn-sm" data-act="clear" aria-label="Remove">${icons.x}</button></div>
        </div></div>
        <div class="pages" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:14px"></div>
      </div>
      <aside class="panel">
        <h3>Output settings</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.image} Convert to images</button>
        <button type="button" class="btn btn-success btn-lg hidden" data-act="dlall">${icons.download} Download all (ZIP)</button>
      </aside>
    </div>`);
  root.append(dzHost, main);

  const format = segmented('Image format', [{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }], preset.format || 'jpg');
  const dpi = segmented(
    'Quality',
    [
      { value: '1', label: 'Normal' },
      { value: '2', label: 'High' },
      { value: '3', label: 'Very high' },
    ],
    '2',
  );
  const adv = advanced();
  const range = textField('Pages (e.g. 1-3, 5)', { placeholder: 'All pages' });
  adv.body.append(range.el);
  main.querySelector('.opts').append(format.el, dpi.el, adv.el);

  const pagesEl = main.querySelector('.pages');
  const runBtn = main.querySelector('[data-act=run]');
  const dlAll = main.querySelector('[data-act=dlall]');

  mountDropzone(dzHost, {
    multiple: false,
    accept: 'application/pdf,.pdf',
    title: 'Drop a PDF file here or click to upload',
    hint: 'PDF files only · processed on your device',
    validate: (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name),
    onFiles: ([f]) => {
      file = f;
      results = [];
      pagesEl.innerHTML = '';
      dlAll.classList.add('hidden');
      main.querySelector('.name').textContent = f.name;
      main.querySelector('.info').textContent = formatBytes(f.size);
      dzHost.classList.add('hidden');
      main.classList.remove('hidden');
    },
  });

  main.querySelector('[data-act=clear]').onclick = () => {
    file = null;
    results = [];
    main.classList.add('hidden');
    dzHost.classList.remove('hidden');
  };

  runBtn.onclick = async () => {
    if (!file) return;
    runBtn.disabled = true;
    const label = runBtn.innerHTML;
    pagesEl.innerHTML = '';
    results = [];
    try {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = parseRange(range.get(), pdf.numPages);
      const mime = format.get() === 'png' ? 'image/png' : 'image/jpeg';
      const base = file.name.replace(/\.pdf$/i, '');
      for (const [i, n] of pages.entries()) {
        runBtn.innerHTML = `<span class="spinner"></span> Page ${i + 1}/${pages.length}`;
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: Number(dpi.get()) * 1.5 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await canvasToBlob(canvas, mime, 0.92);
        const name = `${base}-page-${n}.${format.get()}`;
        results.push({ blob, name });
        const card = html(`
          <figure style="margin:0;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:8px;text-align:center">
            <img src="${URL.createObjectURL(blob)}" alt="Page ${n}" style="width:100%;height:170px;object-fit:contain;background:#fff;border-radius:6px" />
            <figcaption style="font-size:.8rem;margin:6px 0" class="muted">Page ${n} · ${formatBytes(blob.size)}</figcaption>
            <button type="button" class="btn btn-success btn-sm">${icons.download} ${escapeHtml(format.get().toUpperCase())}</button>
          </figure>`);
        card.querySelector('button').onclick = () => downloadBlob(blob, name);
        pagesEl.appendChild(card);
        page.cleanup();
      }
      dlAll.classList.toggle('hidden', results.length < 2);
      toastSuccess(`Converted ${results.length} page${results.length > 1 ? 's' : ''}.`);
      if (results.length === 1) downloadBlob(results[0].blob, results[0].name);
    } catch (err) {
      console.error(err);
      toastError(err.name === 'PasswordException' ? 'This PDF is password-protected.' : 'Could not read this PDF.');
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = label;
    }
  };

  dlAll.onclick = () => downloadZip(results, `${(file?.name || 'pdf').replace(/\.pdf$/i, '')}-images.zip`).catch((e) => toastError(e.message));
}
