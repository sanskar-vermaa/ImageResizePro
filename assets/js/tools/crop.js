// Crop Image: interactive crop box with aspect-ratio presets.
import { html, renameExt, clamp } from '../core/utils.js';
import { icons } from '../core/icons.js';
import { mountDropzone, onPasteImages } from '../core/dropzone.js';
import { segmented, numberField } from '../core/controls.js';
import { loadImage, createCanvas, canvasToBlob, canEncode, EXT_FOR_MIME } from '../core/image.js';
import { downloadBlob } from '../core/download.js';
import { toastError, toastSuccess } from '../core/toast.js';

const RATIOS = [
  { value: 'free', label: 'Free' },
  { value: '1', label: '1:1' },
  { value: '4/3', label: '4:3' },
  { value: '3/4', label: '3:4' },
  { value: '16/9', label: '16:9' },
  { value: '9/16', label: '9:16' },
];

export default function mount(root, preset = {}) {
  root.innerHTML = '';
  let img = null;
  let file = null;
  let ratio = null; // width / height, null = free
  // crop box in image pixels
  const box = { x: 0, y: 0, w: 0, h: 0 };

  const dzHost = html('<div></div>');
  const main = html(`
    <div class="tool-layout hidden">
      <div>
        <div class="crop-stage" style="position:relative;user-select:none;touch-action:none;margin:0 auto;max-width:100%">
          <img class="crop-img" alt="Image to crop" style="width:100%;height:auto;border-radius:8px" draggable="false" />
          <div class="crop-box">
            ${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => `<span class="h h-${h}" data-h="${h}"></span>`).join('')}
          </div>
        </div>
      </div>
      <aside class="panel">
        <h3>Crop</h3>
        <div class="opts"></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="run">${icons.crop} Crop &amp; download</button>
        <button type="button" class="btn btn-secondary btn-sm" data-act="change">${icons.refresh} Change image</button>
      </aside>
    </div>`);
  root.append(dzHost, main);

  const stage = main.querySelector('.crop-stage');
  const imgEl = main.querySelector('.crop-img');
  const boxEl = main.querySelector('.crop-box');
  const opts = main.querySelector('.opts');

  const aspect = segmented('Aspect ratio', RATIOS, preset.ratio || 'free', (v) => setRatio(v));
  const wF = numberField('Width (px)', { min: 1 }, (v) => {
    if (!v) return;
    box.w = clamp(v, 1, img.naturalWidth - box.x);
    if (ratio) box.h = Math.round(box.w / ratio);
    fitBox();
  });
  const hF = numberField('Height (px)', { min: 1 }, (v) => {
    if (!v) return;
    box.h = clamp(v, 1, img.naturalHeight - box.y);
    if (ratio) box.w = Math.round(box.h * ratio);
    fitBox();
  });
  const row = html('<div class="row"></div>');
  row.append(wF.el, hF.el);
  const shape = segmented(
    'Shape',
    [
      { value: 'rect', label: 'Rectangle' },
      { value: 'circle', label: 'Circle' },
    ],
    preset.shape || 'rect',
    (v) => {
      boxEl.classList.toggle('round', v === 'circle');
      if (v === 'circle') {
        aspect.set('1', true);
      }
    },
  );
  opts.append(shape.el, aspect.el, row);

  function setRatio(v) {
    const [a, b = 1] = String(v).split('/').map(Number);
    ratio = v === 'free' ? null : a / b;
    if (ratio && img) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let w = iw * 0.8;
      let h = w / ratio;
      if (h > ih * 0.8) {
        h = ih * 0.8;
        w = h * ratio;
      }
      Object.assign(box, { w: Math.round(w), h: Math.round(h), x: Math.round((iw - w) / 2), y: Math.round((ih - h) / 2) });
    }
    paint();
  }

  function fitBox() {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    box.w = clamp(Math.round(box.w), 10, iw);
    box.h = clamp(Math.round(box.h), 10, ih);
    box.x = clamp(Math.round(box.x), 0, iw - box.w);
    box.y = clamp(Math.round(box.y), 0, ih - box.h);
    paint();
  }

  function paint() {
    if (!img) return;
    const k = imgEl.clientWidth / img.naturalWidth;
    Object.assign(boxEl.style, {
      left: `${box.x * k}px`,
      top: `${box.y * k}px`,
      width: `${box.w * k}px`,
      height: `${box.h * k}px`,
    });
    if (document.activeElement !== wF.input) wF.set(box.w);
    if (document.activeElement !== hF.input) hF.set(box.h);
  }

  // Pointer interaction: move the box or drag a handle.
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (!img) return;
    const handle = e.target.dataset?.h;
    const inside = e.target === boxEl;
    if (!handle && !inside) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    drag = { handle: handle || 'move', sx: e.clientX, sy: e.clientY, start: { ...box } };
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = img.naturalWidth / imgEl.clientWidth;
    const dx = (e.clientX - drag.sx) * k;
    const dy = (e.clientY - drag.sy) * k;
    const s = drag.start;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (drag.handle === 'move') {
      box.x = clamp(s.x + dx, 0, iw - s.w);
      box.y = clamp(s.y + dy, 0, ih - s.h);
    } else {
      let { x, y, w, h } = s;
      const hd = drag.handle;
      if (hd.includes('e')) w = clamp(s.w + dx, 10, iw - s.x);
      if (hd.includes('s')) h = clamp(s.h + dy, 10, ih - s.y);
      if (hd.includes('w')) {
        w = clamp(s.w - dx, 10, s.x + s.w);
        x = s.x + s.w - w;
      }
      if (hd.includes('n')) {
        h = clamp(s.h - dy, 10, s.y + s.h);
        y = s.y + s.h - h;
      }
      if (ratio) {
        if (hd === 'n' || hd === 's') w = h * ratio;
        else h = w / ratio;
        if (x + w > iw) {
          w = iw - x;
          h = w / ratio;
        }
        if (y + h > ih) {
          h = ih - y;
          w = h * ratio;
        }
        if (hd.includes('n')) y = s.y + s.h - h;
        if (hd.includes('w')) x = s.x + s.w - w;
      }
      Object.assign(box, { x, y, w, h });
    }
    fitBox();
  });
  const stop = () => (drag = null);
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);
  window.addEventListener('resize', paint);

  async function setFile([f]) {
    try {
      img = await loadImage(f);
      file = f;
      imgEl.src = img.src;
      dzHost.classList.add('hidden');
      main.classList.remove('hidden');
      await new Promise((r) => (imgEl.complete ? r() : (imgEl.onload = r)));
      Object.assign(box, {
        x: Math.round(img.naturalWidth * 0.1),
        y: Math.round(img.naturalHeight * 0.1),
        w: Math.round(img.naturalWidth * 0.8),
        h: Math.round(img.naturalHeight * 0.8),
      });
      setRatio(aspect.get());
      boxEl.classList.toggle('round', shape.get() === 'circle');
    } catch (e) {
      toastError(e.message);
    }
  }

  main.querySelector('[data-act=run]').onclick = async () => {
    if (!img) return;
    const c = createCanvas(box.w, box.h);
    const ctx = c.getContext('2d');
    const circle = shape.get() === 'circle';
    let mime = circle ? 'image/png' : canEncode(file.type) ? file.type : 'image/png';
    if (circle) {
      ctx.beginPath();
      ctx.ellipse(c.width / 2, c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    } else if (mime === 'image/jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, c.width, c.height);
    const blob = await canvasToBlob(c, mime, 0.95);
    downloadBlob(blob, renameExt(file.name.replace(/(\.[^.]+)?$/, '-cropped$1'), EXT_FOR_MIME[mime]));
    toastSuccess(`Cropped to ${c.width}×${c.height}px`);
  };

  const dz = mountDropzone(dzHost, { multiple: false, onFiles: setFile, title: 'Drop an image to crop' });
  onPasteImages(setFile);
  main.querySelector('[data-act=change]').onclick = () => dz.open();
}
