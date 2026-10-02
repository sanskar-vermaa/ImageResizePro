// Image to PDF: combine images into one PDF with page size, orientation and margin options.
import { html, escapeHtml, formatBytes } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { segmented, slider, textField, advanced } from '../core/controls.js';
import { loadImage, imageToCanvas, canvasToBlob } from '../core/image.js';
import { loadJsPDF } from '../core/libs.js';
import { downloadBlob } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

const PAGE_SIZES = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  a3: [297, 420],
  a5: [148, 210],
};
const MARGINS = { none: 0, small: 10, large: 20 };

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export default function mount(root, preset = {}) {
  const items = [];
  let uid = 0;
  root.innerHTML = '';

  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <p class="muted" style="margin:0 0 10px;font-size:.9rem">Drag the pages to change their order.</p>
        <div class="file-list"></div>
        <div class="actions" style="justify-content:flex-start">
          <button type="button" class="btn btn-secondary btn-sm" data-act="add">${icons.plus} Add more images</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="clear">${icons.trash} Clear all</button>
        </div>
      </div>
      <aside class="panel">
        <h3>PDF settings</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.pdf} Create PDF</button>
        <div class="summary muted" style="font-size:.88rem;text-align:center"></div>
      </aside>
    </div>`);
  root.append(dzHost, main);
  const listEl = main.querySelector('.file-list');
  const runBtn = main.querySelector('[data-act=run]');
  const summary = main.querySelector('.summary');
  const opts = main.querySelector('.opts');

  const size = segmented(
    'Page size',
    [
      { value: 'a4', label: 'A4' },
      { value: 'letter', label: 'Letter' },
      { value: 'fit', label: 'Fit image' },
    ],
    preset.pageSize || 'a4',
  );
  const orient = segmented(
    'Orientation',
    [
      { value: 'auto', label: 'Auto' },
      { value: 'p', label: 'Portrait' },
      { value: 'l', label: 'Landscape' },
    ],
    'auto',
  );
  const margin = segmented(
    'Margin',
    [
      { value: 'none', label: 'None' },
      { value: 'small', label: 'Small' },
      { value: 'large', label: 'Large' },
    ],
    'small',
  );
  const adv = advanced();
  const more = segmented(
    'More page sizes',
    [
      { value: 'legal', label: 'Legal' },
      { value: 'a3', label: 'A3' },
      { value: 'a5', label: 'A5' },
    ],
    null,
    (v) => size.set(v),
  );
  const quality = slider('Image quality', { min: 30, max: 100, value: 85, unit: '%' });
  const fname = textField('File name', { value: preset.fileName || 'images.pdf' });
  adv.body.append(more.el, quality.el, fname.el);
  opts.append(size.el, orient.el, margin.el, adv.el);

  const dz = mountDropzone(dzHost, { multiple: true, onFiles: add, title: 'Drop images here to make a PDF' });
  onPasteImages(add);

  function add(files) {
    files.forEach((file) => items.push({ id: ++uid, file, thumb: URL.createObjectURL(file) }));
    dzHost.classList.add('hidden');
    main.classList.remove('hidden');
    summary.textContent = '';
    render();
  }

  let dragId = null;
  function render() {
    listEl.innerHTML = '';
    items.forEach((it, i) => {
      const row = html(`
        <div class="file-item" draggable="true" data-id="${it.id}">
          <img src="${it.thumb}" alt="" />
          <div class="meta"><div class="name">${i + 1}. ${escapeHtml(it.file.name)}</div><div class="info">${formatBytes(it.file.size)}</div></div>
          <div class="ops">
            <button type="button" class="btn btn-ghost btn-sm" data-up aria-label="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn btn-ghost btn-sm" data-down aria-label="Move down" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="btn btn-ghost btn-sm" data-rm aria-label="Remove">${icons.x}</button>
          </div>
        </div>`);
      row.querySelector('[data-rm]').onclick = () => remove(it.id);
      row.querySelector('[data-up]').onclick = () => move(i, i - 1);
      row.querySelector('[data-down]').onclick = () => move(i, i + 1);
      row.addEventListener('dragstart', () => {
        dragId = it.id;
        row.classList.add('dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', (e) => e.preventDefault());
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = items.findIndex((x) => x.id === dragId);
        if (from > -1) move(from, i);
      });
      listEl.appendChild(row);
    });
  }

  function move(from, to) {
    if (to < 0 || to >= items.length || from === to) return;
    const [it] = items.splice(from, 1);
    items.splice(to, 0, it);
    render();
  }

  function remove(id) {
    const i = items.findIndex((x) => x.id === id);
    URL.revokeObjectURL(items[i].thumb);
    items.splice(i, 1);
    if (!items.length) reset();
    else render();
  }

  function reset() {
    items.forEach((it) => URL.revokeObjectURL(it.thumb));
    items.length = 0;
    main.classList.add('hidden');
    dzHost.classList.remove('hidden');
  }

  async function createPdf() {
    if (!items.length) return;
    runBtn.disabled = true;
    const label = runBtn.innerHTML;
    try {
      const jsPDF = await loadJsPDF();
      let doc = null;
      const m = MARGINS[margin.get()];
      for (let i = 0; i < items.length; i++) {
        runBtn.innerHTML = `<span class="spinner"></span> Page ${i + 1}/${items.length}`;
        const img = await loadImage(items[i].file);
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        // Re-encode as JPEG to keep the PDF small (flatten transparency onto white).
        const canvas = imageToCanvas(img, { background: '#ffffff' });
        const dataUrl = await blobToDataUrl(await canvasToBlob(canvas, 'image/jpeg', quality.get() / 100));
        URL.revokeObjectURL(img._objectUrl);

        let pw;
        let ph;
        if (size.get() === 'fit') {
          // 1px = 0.2646mm at 96dpi
          pw = iw * 0.2646 + m * 2;
          ph = ih * 0.2646 + m * 2;
        } else {
          [pw, ph] = PAGE_SIZES[size.get()];
          const o = orient.get() === 'auto' ? (iw > ih ? 'l' : 'p') : orient.get();
          if (o === 'l') [pw, ph] = [ph, pw];
        }
        const pageOrient = pw > ph ? 'l' : 'p';
        if (!doc) doc = new jsPDF({ orientation: pageOrient, unit: 'mm', format: [pw, ph], compress: true });
        else doc.addPage([pw, ph], pageOrient);

        const boxW = pw - m * 2;
        const boxH = ph - m * 2;
        const r = Math.min(boxW / iw, boxH / ih);
        const dw = iw * r;
        const dh = ih * r;
        doc.addImage(dataUrl, 'JPEG', (pw - dw) / 2, (ph - dh) / 2, dw, dh, undefined, 'FAST');
      }
      const blob = doc.output('blob');
      let name = fname.get().trim() || 'images.pdf';
      if (!/\.pdf$/i.test(name)) name += '.pdf';
      downloadBlob(blob, name);
      summary.innerHTML = `PDF created: <b>${items.length} page${items.length > 1 ? 's' : ''}</b>, ${formatBytes(blob.size)}`;
      toastSuccess('Your PDF is ready!');
    } catch (err) {
      console.error(err);
      toastError(err.message || 'Could not create the PDF.');
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = label;
    }
  }

  runBtn.onclick = createPdf;
  main.querySelector('[data-act=add]').onclick = () => dz.open();
  main.querySelector('[data-act=clear]').onclick = reset;
}
