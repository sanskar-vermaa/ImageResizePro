// Reusable drag & drop / click / paste file picker.
import { html } from './utils.js';
import { icons } from './icons.js';
import { isImageFile } from './image.js';
import { toastError } from './toast.js';

/**
 * mountDropzone(container, { multiple, accept, title, hint, onFiles })
 * Returns { el, open() }.
 */
export function mountDropzone(container, opts = {}) {
  const {
    multiple = true,
    accept = 'image/*',
    title = multiple ? 'Drop images here or click to upload' : 'Drop an image here or click to upload',
    hint = 'JPG, PNG, WEBP, GIF, BMP · Ctrl+V to paste',
    validate = isImageFile,
    onFiles,
  } = opts;

  const el = html(`
    <label class="dropzone" tabindex="0">
      <span class="dz-icon">${icons.upload}</span>
      <strong>${title}</strong>
      <span class="btn btn-primary">${icons.plus} Select ${multiple ? 'files' : 'file'}</span>
      <small>${hint}</small>
      <input type="file" accept="${accept}" ${multiple ? 'multiple' : ''} aria-label="${title}" />
    </label>`);
  const input = el.querySelector('input');

  const handle = (fileList) => {
    let files = [...fileList];
    const bad = files.filter((f) => !validate(f));
    files = files.filter(validate);
    if (bad.length) toastError(`Skipped ${bad.length} unsupported file(s).`);
    if (!multiple) files = files.slice(0, 1);
    if (files.length && onFiles) onFiles(files);
  };

  input.addEventListener('change', () => {
    handle(input.files);
    input.value = '';
  });

  ['dragenter', 'dragover'].forEach((ev) =>
    el.addEventListener(ev, (e) => {
      e.preventDefault();
      el.classList.add('drag');
    }),
  );
  ['dragleave', 'drop'].forEach((ev) =>
    el.addEventListener(ev, (e) => {
      e.preventDefault();
      el.classList.remove('drag');
    }),
  );
  el.addEventListener('drop', (e) => handle(e.dataTransfer.files));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  container.appendChild(el);
  return { el, open: () => input.click(), handle };
}

/** Listen for pasted images anywhere on the page. */
export function onPasteImages(callback) {
  window.addEventListener('paste', (e) => {
    const files = [...(e.clipboardData?.files || [])].filter(isImageFile);
    if (files.length) {
      e.preventDefault();
      callback(files);
    }
  });
}
