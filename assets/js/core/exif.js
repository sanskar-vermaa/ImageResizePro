// Minimal EXIF reader + lossless metadata stripping for JPEG and PNG.

const TAGS = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x9003: 'DateTimeOriginal',
  0x920a: 'FocalLength',
  0xa002: 'PixelWidth',
  0xa003: 'PixelHeight',
  0xa434: 'LensModel',
};
const GPS_TAGS = { 1: 'GPSLatitudeRef', 2: 'GPSLatitude', 3: 'GPSLongitudeRef', 4: 'GPSLongitude', 6: 'GPSAltitude' };

function readIFD(v, tiff, offset, little, dict, out) {
  const n = v.getUint16(offset, little);
  for (let i = 0; i < n; i++) {
    const e = offset + 2 + i * 12;
    const tag = v.getUint16(e, little);
    const type = v.getUint16(e + 2, little);
    const count = v.getUint32(e + 4, little);
    const size = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] || 1;
    const valOff = size * count > 4 ? tiff + v.getUint32(e + 8, little) : e + 8;
    let value;
    if (type === 2) {
      value = '';
      for (let j = 0; j < count - 1; j++) value += String.fromCharCode(v.getUint8(valOff + j));
      value = value.trim();
    } else if (type === 3) value = v.getUint16(valOff, little);
    else if (type === 4) value = v.getUint32(valOff, little);
    else if (type === 5 || type === 10) {
      const vals = [];
      for (let j = 0; j < count; j++) {
        const num = type === 5 ? v.getUint32(valOff + j * 8, little) : v.getInt32(valOff + j * 8, little);
        const den = type === 5 ? v.getUint32(valOff + j * 8 + 4, little) : v.getInt32(valOff + j * 8 + 4, little);
        vals.push(den ? num / den : 0);
      }
      value = count === 1 ? vals[0] : vals;
    }
    if (tag === 0x8769 || tag === 0x8825) {
      readIFD(v, tiff, tiff + v.getUint32(e + 8, little), little, tag === 0x8825 ? GPS_TAGS : TAGS, out);
    } else if (dict[tag] && value !== undefined) out[dict[tag]] = value;
  }
}

/** Parse EXIF from a JPEG ArrayBuffer. Returns a flat object (empty if none). */
export function readExif(buffer) {
  const v = new DataView(buffer);
  const out = {};
  if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return out;
  let p = 2;
  while (p + 4 < v.byteLength) {
    const marker = v.getUint16(p);
    const len = v.getUint16(p + 2);
    if (marker === 0xffe1 && v.getUint32(p + 4) === 0x45786966) {
      const tiff = p + 10;
      const little = v.getUint16(tiff) === 0x4949;
      try {
        readIFD(v, tiff, tiff + v.getUint32(tiff + 4, little), little, TAGS, out);
      } catch {
        /* truncated EXIF */
      }
      break;
    }
    if (marker === 0xffda) break;
    p += 2 + len;
  }
  if (Array.isArray(out.GPSLatitude) && Array.isArray(out.GPSLongitude)) {
    const dms = (a) => a[0] + a[1] / 60 + a[2] / 3600;
    out.Location = `${(dms(out.GPSLatitude) * (out.GPSLatitudeRef === 'S' ? -1 : 1)).toFixed(5)}, ${(dms(out.GPSLongitude) * (out.GPSLongitudeRef === 'W' ? -1 : 1)).toFixed(5)}`;
  }
  delete out.GPSLatitude;
  delete out.GPSLongitude;
  delete out.GPSLatitudeRef;
  delete out.GPSLongitudeRef;
  if (typeof out.ExposureTime === 'number' && out.ExposureTime < 1) out.ExposureTime = `1/${Math.round(1 / out.ExposureTime)} s`;
  if (typeof out.FNumber === 'number') out.FNumber = `f/${out.FNumber.toFixed(1)}`;
  if (typeof out.FocalLength === 'number') out.FocalLength = `${Math.round(out.FocalLength)} mm`;
  return out;
}

/** Remove APP1–APP15 (EXIF, XMP, ICC kept? no — APP2 ICC kept for colour accuracy) and COM segments from a JPEG. */
export function stripJpeg(buffer) {
  const v = new DataView(buffer);
  const src = new Uint8Array(buffer);
  if (v.getUint16(0) !== 0xffd8) return null;
  const parts = [src.slice(0, 2)];
  let p = 2;
  while (p + 4 <= v.byteLength) {
    const marker = v.getUint16(p);
    if (marker === 0xffda) {
      parts.push(src.slice(p));
      break;
    }
    const len = v.getUint16(p + 2);
    const isApp = marker >= 0xffe1 && marker <= 0xffef && marker !== 0xffe2;
    if (!isApp && marker !== 0xfffe) parts.push(src.slice(p, p + 2 + len));
    p += 2 + len;
  }
  return new Blob(parts, { type: 'image/jpeg' });
}

/** Remove text / EXIF / time chunks from a PNG. */
export function stripPng(buffer) {
  const src = new Uint8Array(buffer);
  const v = new DataView(buffer);
  if (v.getUint32(0) !== 0x89504e47) return null;
  const drop = new Set(['tEXt', 'iTXt', 'zTXt', 'eXIf', 'tIME']);
  const parts = [src.slice(0, 8)];
  let p = 8;
  while (p + 8 <= v.byteLength) {
    const len = v.getUint32(p);
    const type = String.fromCharCode(...src.slice(p + 4, p + 8));
    const end = p + 12 + len;
    if (!drop.has(type)) parts.push(src.slice(p, end));
    p = end;
    if (type === 'IEND') break;
  }
  return new Blob(parts, { type: 'image/png' });
}
