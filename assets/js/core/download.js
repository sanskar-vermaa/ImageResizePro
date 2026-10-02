// Download helpers: single file, many files as ZIP.
import { loadJSZip } from './libs.js';

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Make names unique: a.jpg, a.jpg -> a.jpg, a-2.jpg */
export function uniqueNames(names) {
  const seen = {};
  return names.map((n) => {
    if (!seen[n]) {
      seen[n] = 1;
      return n;
    }
    seen[n] += 1;
    return n.replace(/(\.[^.]+)?$/, `-${seen[n]}$1`);
  });
}

/** items: [{ blob, name }] */
export async function downloadZip(items, zipName = 'imageresizepro.zip') {
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  const names = uniqueNames(items.map((i) => i.name));
  items.forEach((item, i) => zip.file(names[i], item.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
}

/** Download one file directly, or several as a ZIP. */
export async function downloadAll(items, zipName) {
  if (!items.length) return;
  if (items.length === 1) return downloadBlob(items[0].blob, items[0].name);
  return downloadZip(items, zipName);
}
