// Encoders the browser does not provide natively: BMP (24-bit) and ICO (PNG-in-ICO).
import { createCanvas, canvasToBlob } from './image.js';

/** Encode a canvas as an uncompressed 24-bit BMP. */
export function canvasToBmp(canvas) {
  const { width: w, height: h } = canvas;
  const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;
  const rowSize = Math.ceil((w * 3) / 4) * 4;
  const pixelBytes = rowSize * h;
  const buf = new ArrayBuffer(54 + pixelBytes);
  const v = new DataView(buf);
  // BITMAPFILEHEADER
  v.setUint8(0, 0x42);
  v.setUint8(1, 0x4d);
  v.setUint32(2, 54 + pixelBytes, true);
  v.setUint32(10, 54, true);
  // BITMAPINFOHEADER
  v.setUint32(14, 40, true);
  v.setInt32(18, w, true);
  v.setInt32(22, h, true); // positive = bottom-up
  v.setUint16(26, 1, true);
  v.setUint16(28, 24, true);
  v.setUint32(34, pixelBytes, true);
  v.setInt32(38, 2835, true);
  v.setInt32(42, 2835, true);
  const out = new Uint8Array(buf);
  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w * 4;
    let dst = 54 + y * rowSize;
    for (let x = 0; x < w; x++) {
      const i = src + x * 4;
      const a = data[i + 3] / 255;
      // flatten alpha onto white
      out[dst++] = Math.round(data[i + 2] * a + 255 * (1 - a));
      out[dst++] = Math.round(data[i + 1] * a + 255 * (1 - a));
      out[dst++] = Math.round(data[i] * a + 255 * (1 - a));
    }
  }
  return new Blob([buf], { type: 'image/bmp' });
}

/**
 * Build a multi-size .ico from a source image/canvas.
 * Modern ICO files may embed PNG data directly, which all current OSes and browsers support.
 */
export async function imageToIco(source, sizes = [16, 32, 48, 64, 128, 256]) {
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  const pngs = [];
  for (const s of sizes) {
    const c = createCanvas(s, s);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    const r = Math.min(s / sw, s / sh);
    const dw = sw * r;
    const dh = sh * r;
    ctx.drawImage(source, (s - dw) / 2, (s - dh) / 2, dw, dh);
    const blob = await canvasToBlob(c, 'image/png');
    pngs.push({ size: s, bytes: new Uint8Array(await blob.arrayBuffer()) });
  }
  const headerSize = 6 + 16 * pngs.length;
  const total = headerSize + pngs.reduce((n, p) => n + p.bytes.length, 0);
  const buf = new ArrayBuffer(total);
  const v = new DataView(buf);
  const out = new Uint8Array(buf);
  v.setUint16(0, 0, true);
  v.setUint16(2, 1, true); // type: icon
  v.setUint16(4, pngs.length, true);
  let offset = headerSize;
  pngs.forEach((p, i) => {
    const e = 6 + i * 16;
    v.setUint8(e, p.size >= 256 ? 0 : p.size);
    v.setUint8(e + 1, p.size >= 256 ? 0 : p.size);
    v.setUint8(e + 2, 0);
    v.setUint8(e + 3, 0);
    v.setUint16(e + 4, 1, true);
    v.setUint16(e + 6, 32, true);
    v.setUint32(e + 8, p.bytes.length, true);
    v.setUint32(e + 12, offset, true);
    out.set(p.bytes, offset);
    offset += p.bytes.length;
  });
  return new Blob([buf], { type: 'image/x-icon' });
}
