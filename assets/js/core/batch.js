// Generic batch-processing UI used by most single-step tools
// (compress, resize, convert, rotate, filters, watermark...).
import { html, escapeHtml, formatBytes, percentChange } from './utils.js';
import { icons } from './icons.js';
import { mountDropzone, onPasteImages } from './dropzone.js';
import { downloadAll, downloadBlob } from './download.js';
import { toastError, toastSuccess } from './toast.js';

/**
 * @param {HTMLElement} root
 * @param {object} cfg
 * @param {(panel: HTMLElement, ctx) => () => object} cfg.renderOptions  builds the options UI and returns a getter
 * @param {(file: File, options: object) => Promise<{blob: Blob, name: string, note?: string}>} cfg.process
 * @param {string} [cfg.actionLabel]
 * @param {string} [cfg.zipName]
 * @param {boolean} [cfg.multiple]
 */
export function createBatchTool(root, cfg) {
  const { multiple = true, actionLabel = 'Process images', zipName = 'images.zip' } = cfg;
  const items = []; // { id, file, thumb, result }
  let uid = 0;

  root.innerHTML = '';
  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="file-list" aria-live="polite"></div>
        <div class="actions" style="justify-content:flex-start">
          ${multiple ? `<button type="button" class="btn btn-secondary btn-sm" data-act="add">${icons.plus} Add more</button>` : ''}
          <button type="button" class="btn btn-ghost btn-sm" data-act="clear">${icons.trash} Clear all</button>
        </div>
      </div>
      <aside class="panel">
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.zap} ${actionLabel}</button>
        <button type="button" class="btn btn-success btn-lg hidden" data-act="dlall">${icons.download} Download all</button>
        <div class="summary muted" style="font-size:.88rem;text-align:center"></div>
      </aside>
    </div>`);
  root.append(dzHost, main);

  const listEl = main.querySelector('.file-list');
  const runBtn = main.querySelector('[data-act=run]');
  const dlAllBtn = main.querySelector('[data-act=dlall]');
  const summaryEl = main.querySelector('.summary');

  const ctx = { items, invalidate };
  const getOptions = cfg.renderOptions ? cfg.renderOptions(main.querySelector('.opts'), ctx) : () => ({});

  const dz = mountDropzone(dzHost, { multiple, onFiles: addFiles, ...(cfg.dropzone || {}) });
  onPasteImages(addFiles);

  function addFiles(files) {
    const list = multiple ? files : files.slice(0, 1);
    if (!multiple) items.length = 0;
    list.forEach((file) => items.push({ id: ++uid, file, thumb: URL.createObjectURL(file), result: null }));
    dzHost.classList.add('hidden');
    main.classList.remove('hidden');
    invalidate();
    cfg.onFilesChanged?.(items, ctx);
  }

  function invalidate() {
    items.forEach((it) => (it.result = null));
    dlAllBtn.classList.add('hidden');
    summaryEl.textContent = '';
    render();
  }

  function render() {
    listEl.innerHTML = '';
    items.forEach((it) => {
      const r = it.result;
      let info = formatBytes(it.file.size);
      if (r?.error) info += ` · <span class="grew">${escapeHtml(r.error)}</span>`;
      else if (r) {
        const pct = percentChange(it.file.size, r.blob.size);
        const cls = pct >= 0 ? 'saved' : 'grew';
        info += ` → <b>${formatBytes(r.blob.size)}</b> <span class="${cls}">${pct >= 0 ? '−' : '+'}${Math.abs(pct)}%</span>`;
        if (r.note) info += ` · ${escapeHtml(r.note)}`;
      }
      const row = html(`
        <div class="file-item">
          <img src="${it.thumb}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
          <div class="meta">
            <div class="name" title="${escapeHtml(it.file.name)}">${escapeHtml(r ? r.name : it.file.name)}</div>
            <div class="info">${info}</div>
          </div>
          <div class="ops">
            ${r && !r.error ? `<button type="button" class="btn btn-success btn-sm" data-dl>${icons.download}<span class="sr-only">Download</span></button>` : ''}
            <button type="button" class="btn btn-ghost btn-sm" data-rm aria-label="Remove">${icons.x}</button>
          </div>
        </div>`);
      row.querySelector('[data-rm]').onclick = () => removeItem(it.id);
      row.querySelector('[data-dl]')?.addEventListener('click', () => downloadBlob(r.blob, r.name));
      listEl.appendChild(row);
    });
  }

  function removeItem(id) {
    const i = items.findIndex((x) => x.id === id);
    if (i > -1) {
      URL.revokeObjectURL(items[i].thumb);
      items.splice(i, 1);
    }
    if (!items.length) reset();
    else render();
    cfg.onFilesChanged?.(items, ctx);
  }

  function reset() {
    items.forEach((it) => URL.revokeObjectURL(it.thumb));
    items.length = 0;
    main.classList.add('hidden');
    dzHost.classList.remove('hidden');
    dlAllBtn.classList.add('hidden');
  }

  async function run() {
    if (!items.length) return;
    const options = getOptions();
    runBtn.disabled = true;
    const label = runBtn.innerHTML;
    let done = 0;
    let before = 0;
    let after = 0;
    for (const it of items) {
      runBtn.innerHTML = `<span class="spinner"></span> ${++done}/${items.length}`;
      try {
        it.result = await cfg.process(it.file, options);
        before += it.file.size;
        after += it.result.blob.size;
      } catch (err) {
        console.error(err);
        it.result = { error: err.message || 'Failed' };
      }
      render();
    }
    runBtn.disabled = false;
    runBtn.innerHTML = label;
    const ok = items.filter((it) => it.result && !it.result.error);
    if (ok.length) {
      dlAllBtn.classList.remove('hidden');
      dlAllBtn.innerHTML = `${icons.download} ${ok.length > 1 ? `Download all (${ok.length}) as ZIP` : 'Download'}`;
      const pct = percentChange(before, after);
      summaryEl.innerHTML = `Total: ${formatBytes(before)} → <b>${formatBytes(after)}</b>${pct > 0 ? ` (saved ${pct}%)` : ''}`;
      toastSuccess(`Done! ${ok.length} image${ok.length > 1 ? 's' : ''} ready.`);
      if (window.matchMedia('(max-width: 900px)').matches) dlAllBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (ok.length < items.length) toastError(`${items.length - ok.length} file(s) failed.`);
  }

  runBtn.onclick = run;
  dlAllBtn.onclick = () =>
    downloadAll(
      items.filter((it) => it.result && !it.result.error).map((it) => it.result),
      zipName,
    ).catch((e) => toastError(e.message));
  main.querySelector('[data-act=clear]').onclick = reset;
  main.querySelector('[data-act=add]')?.addEventListener('click', () => dz.open());

  return ctx;
}
