// Lightweight toast notifications.

let wrap;

function ensureWrap() {
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(wrap);
  }
  return wrap;
}

export function toast(message, type = 'info', ms = 3200) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  ensureWrap().appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, ms);
}

export const toastError = (m) => toast(m, 'error', 4500);
export const toastSuccess = (m) => toast(m, 'success');
