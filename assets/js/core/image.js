// Image decoding / encoding helpers built on <canvas>.

export const MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  ico: 'image/x-icon',
};

export const EXT_FOR_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/x-icon': 'ico',
};

export const isHeic = (f) => /image\/hei[cf]/i.test(f.type || '') || /\.hei[cf]$/i.test(f.name || '');

/** Load a File/Blob into an HTMLImageElement. HEIC/HEIF (iPhone) photos are decoded via heic2any when needed. */
export async function loadImage(fileOrBlob) {
  try {
    return await decodeImage(fileOrBlob);
  } catch (err) {
    if (!isHeic(fileOrBlob)) throw err;
    const { loadHeic2any } = await import('./libs.js');
    const heic2any = await loadHeic2any();
    const out = await heic2any({ blob: fileOrBlob, toType: 'image/jpeg', quality: 0.95 });
    return decodeImage(Array.isArray(out) ? out[0] : out);
  }
}

function decodeImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      img._objectUrl = url;
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read "${fileOrBlob.name || 'image'}". Is it a valid image?`));
    };
    img.src = url;
  });
}

export function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Draw an image to a new canvas, optionally with a background fill (for JPG). */
export function imageToCanvas(img, { width, height, background, smoothing = 'high' } = {}) {
  const w = width || img.naturalWidth || img.width;
  const h = height || img.naturalHeight || img.height;
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = smoothing;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** canvas.toBlob as a promise. quality is 0..1 (ignored for PNG). */
export function canvasToBlob(canvas, mime = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Your browser could not encode this format.'))),
      mime,
      quality,
    );
  });
}

/** Feature-detect whether the browser can encode a mime type. */
const encodeCache = {};
export function canEncode(mime) {
  if (mime in encodeCache) return encodeCache[mime];
  const c = createCanvas(1, 1);
  const ok = c.toDataURL(mime).startsWith(`data:${mime}`);
  encodeCache[mime] = ok;
  return ok;
}

export function isImageFile(file) {
  return file && (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif|svg|ico|heic)$/i.test(file.name));
}

export function fitWithin(w, h, maxW, maxH) {
  const r = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.round(w * r), height: Math.round(h * r) };
}
