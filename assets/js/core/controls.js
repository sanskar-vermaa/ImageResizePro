// Small builders for option controls inside tool panels.
import { html, escapeHtml } from './utils.js';

let n = 0;
const nid = (p) => `${p}-${++n}`;

/** Segmented button group. Returns { el, get(), set(v), onChange } */
export function segmented(label, options, value, onChange) {
  const el = html(`<div class="field"><span class="label">${escapeHtml(label)}</span><div class="segmented" role="group" aria-label="${escapeHtml(label)}"></div></div>`);
  const group = el.querySelector('.segmented');
  let current = value;
  const btns = options.map((o) => {
    const opt = typeof o === 'string' ? { value: o, label: o.toUpperCase() } : o;
    const b = html(`<button type="button" aria-pressed="false">${escapeHtml(opt.label)}</button>`);
    b.onclick = () => set(opt.value, true);
    b._value = opt.value;
    group.appendChild(b);
    return b;
  });
  function set(v, fire) {
    current = v;
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b._value === v)));
    if (fire) onChange?.(v);
  }
  set(value);
  return { el, get: () => current, set };
}

/** Range slider with live value label. */
export function slider(label, { min = 0, max = 100, step = 1, value = 50, unit = '' } = {}, onInput) {
  const id = nid('rng');
  const el = html(`
    <div class="field">
      <label for="${id}" style="display:flex;justify-content:space-between">${escapeHtml(label)} <output>${value}${unit}</output></label>
      <input id="${id}" class="range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
    </div>`);
  const input = el.querySelector('input');
  const out = el.querySelector('output');
  input.addEventListener('input', () => {
    out.textContent = `${input.value}${unit}`;
    onInput?.(Number(input.value));
  });
  return {
    el,
    input,
    get: () => Number(input.value),
    set: (v) => {
      input.value = v;
      out.textContent = `${v}${unit}`;
    },
  };
}

export function numberField(label, { value = '', min, max, step = 1, placeholder = '', hint = '' } = {}, onInput) {
  const id = nid('num');
  const el = html(`
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <input id="${id}" class="input" type="number" inputmode="decimal" value="${value}" ${min != null ? `min="${min}"` : ''} ${max != null ? `max="${max}"` : ''} step="${step}" placeholder="${escapeHtml(placeholder)}" />
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ''}
    </div>`);
  const input = el.querySelector('input');
  input.addEventListener('input', () => onInput?.(input.value === '' ? null : Number(input.value)));
  return { el, input, get: () => (input.value === '' ? null : Number(input.value)), set: (v) => (input.value = v ?? '') };
}

export function textField(label, { value = '', placeholder = '' } = {}, onInput) {
  const id = nid('txt');
  const el = html(`<div class="field"><label for="${id}">${escapeHtml(label)}</label><input id="${id}" class="input" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" /></div>`);
  const input = el.querySelector('input');
  input.addEventListener('input', () => onInput?.(input.value));
  return { el, input, get: () => input.value, set: (v) => (input.value = v) };
}

export function selectField(label, options, value, onChange) {
  const id = nid('sel');
  const el = html(`<div class="field"><label for="${id}">${escapeHtml(label)}</label><select id="${id}" class="select"></select></div>`);
  const sel = el.querySelector('select');
  options.forEach((o) => {
    const opt = typeof o === 'string' ? { value: o, label: o } : o;
    const op = document.createElement('option');
    op.value = opt.value;
    op.textContent = opt.label;
    sel.appendChild(op);
  });
  sel.value = value;
  sel.addEventListener('change', () => onChange?.(sel.value));
  return { el, input: sel, get: () => sel.value, set: (v) => (sel.value = v) };
}

export function checkbox(label, checked = false, onChange) {
  const el = html(`<label class="check"><input type="checkbox" ${checked ? 'checked' : ''} /> ${escapeHtml(label)}</label>`);
  const input = el.querySelector('input');
  input.addEventListener('change', () => onChange?.(input.checked));
  return { el, input, get: () => input.checked, set: (v) => (input.checked = v) };
}

export function colorField(label, value = '#ffffff', onInput) {
  const id = nid('col');
  const el = html(`<div class="field"><label for="${id}">${escapeHtml(label)}</label><input id="${id}" type="color" value="${value}" style="width:100%;height:40px;border:1px solid var(--border);border-radius:10px;background:var(--surface);padding:3px" /></div>`);
  const input = el.querySelector('input');
  input.addEventListener('input', () => onInput?.(input.value));
  return { el, input, get: () => input.value, set: (v) => (input.value = v) };
}

/** Collapsible "Advanced options" group to keep the default UI simple. */
export function advanced(label = 'Advanced options') {
  const el = html(`<details class="advanced"><summary>${escapeHtml(label)}</summary><div class="advanced-body"></div></details>`);
  return { el, body: el.querySelector('.advanced-body') };
}
