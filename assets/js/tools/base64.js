// Image ⇄ Base64: encode images to data URIs, or decode Base64 back to an image.
import { html, formatBytes, escapeHtml } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { segmented } from '../core/controls.js';
import { downloadBlob } from '../core/download.js';
import { toast, toastError } from '../core/toast.js';
import { EXT_FOR_MIME } from '../core/image.js';

function readDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function dataUrlToBlob(input) {
  let str = input.trim().replace(/\s+/g, '');
  let mime = 'image/png';
  const m = str.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (m) {
    mime = m[1] || mime;
    str = m[3];
  } else if (str.startsWith('/9j/')) mime = 'image/jpeg';
  else if (str.startsWith('R0lGOD')) mime = 'image/gif';
  else if (str.startsWith('UklGR')) mime = 'image/webp';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function mount(root, preset = {}) {
  root.innerHTML = '';
  const modeSel = segmented(
    'Mode',
    [
      { value: 'encode', label: 'Image → Base64' },
      { value: 'decode', label: 'Base64 → Image' },
    ],
    preset.mode || 'encode',
    (v) => setMode(v),
  );
  modeSel.el.style.alignItems = 'center';
  modeSel.el.style.marginBottom = '18px';
  root.appendChild(modeSel.el);

  // ----- encode -----
  const enc = html(`<div></div>`);
  const encOut = html(`
    <div class="hidden" style="display:grid;gap:12px">
      <div class="stat-line"></div>
      <div class="segmented fmt" role="group"></div>
      <textarea class="input out" rows="9" readonly style="font-family:ui-monospace,monospace;font-size:.8rem;resize:vertical"></textarea>
      <div class="actions" style="justify-content:flex-start;margin:0">
        <button type="button" class="btn btn-primary" data-copy>${icons.check} Copy</button>
        <button type="button" class="btn btn-secondary" data-new>${icons.refresh} Another image</button>
      </div>
    </div>`);
  const encDz = html('<div></div>');
  enc.append(encDz, encOut);
  let dataUrl = '';
  let fmt = 'data';
  const fmtEl = encOut.querySelector('.fmt');
  const FORMATS = {
    data: { label: 'Data URI', make: (d) => d },
    raw: { label: 'Base64 only', make: (d) => d.split(',')[1] },
    img: { label: '<img> tag', make: (d) => `<img src="${d}" alt="" />` },
    css: { label: 'CSS', make: (d) => `background-image: url("${d}");` },
  };
  Object.entries(FORMATS).forEach(([k, v]) => {
    const b = html(`<button type="button" aria-pressed="${k === fmt}">${escapeHtml(v.label)}</button>`);
    b.onclick = () => {
      fmt = k;
      [...fmtEl.children].forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      paint();
    };
    fmtEl.appendChild(b);
  });
  const outTa = encOut.querySelector('.out');
  const paint = () => (outTa.value = dataUrl ? FORMATS[fmt].make(dataUrl) : '');
  const dz = mountDropzone(encDz, {
    multiple: false,
    hint: 'Best for small images like icons and logos',
    onFiles: async ([f]) => {
      dataUrl = await readDataUrl(f);
      encOut.querySelector('.stat-line').innerHTML = `<span><b>${escapeHtml(f.name)}</b></span><span>Original ${formatBytes(f.size)}</span><span>Base64 ${formatBytes(dataUrl.length)}</span>`;
      paint();
      encDz.classList.add('hidden');
      encOut.classList.remove('hidden');
    },
  });
  encOut.querySelector('[data-copy]').onclick = async () => {
    try {
      await navigator.clipboard.writeText(outTa.value);
      toast('Copied to clipboard');
    } catch {
      outTa.select();
      document.execCommand('copy');
      toast('Copied');
    }
  };
  encOut.querySelector('[data-new]').onclick = () => {
    encOut.classList.add('hidden');
    encDz.classList.remove('hidden');
    dz.open();
  };

  // ----- decode -----
  const dec = html(`
    <div class="hidden" style="display:grid;gap:12px">
      <textarea class="input in" rows="8" placeholder="Paste a Base64 string or data:image/... URI here" style="font-family:ui-monospace,monospace;font-size:.8rem"></textarea>
      <div class="actions" style="justify-content:flex-start;margin:0">
        <button type="button" class="btn btn-primary" data-dec>${icons.image} Show image</button>
        <button type="button" class="btn btn-success hidden" data-dl>${icons.download} Download</button>
      </div>
      <div class="preview-box hidden"><img alt="Decoded image" /></div>
    </div>`);
  let decoded = null;
  dec.querySelector('[data-dec]').onclick = () => {
    try {
      decoded = dataUrlToBlob(dec.querySelector('.in').value);
      const img = dec.querySelector('img');
      img.onerror = () => toastError('That does not look like a valid image.');
      img.src = URL.createObjectURL(decoded);
      dec.querySelector('.preview-box').classList.remove('hidden');
      dec.querySelector('[data-dl]').classList.remove('hidden');
    } catch {
      toastError('Invalid Base64 data.');
    }
  };
  dec.querySelector('[data-dl]').onclick = () => decoded && downloadBlob(decoded, `decoded.${EXT_FOR_MIME[decoded.type] || 'png'}`);

  root.append(enc, dec);
  onPasteImages(([f]) => modeSel.get() === 'encode' && dz.handle([f]));

  function setMode(v) {
    enc.classList.toggle('hidden', v !== 'encode');
    dec.classList.toggle('hidden', v !== 'decode');
  }
  setMode(modeSel.get());
}
