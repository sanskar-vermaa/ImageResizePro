// Shared helpers used by every tool.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Create an element from an HTML string. */
export function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 1536 -> "1.5 KB" */
export function formatBytes(bytes, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${units[i]}`;
}

export function percentChange(before, after) {
  if (!before) return 0;
  return Math.round(((before - after) / before) * 100);
}

/** Replace a file's extension: "photo.png", "jpg" -> "photo.jpg" */
export function renameExt(name, ext) {
  const base = name.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.${ext}`;
}

export function addSuffix(name, suffix) {
  const m = name.match(/^(.*?)(\.[^.]+)?$/);
  return `${m[1] || 'image'}-${suffix}${m[2] || ''}`;
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
