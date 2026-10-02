// Lazy-load third-party libraries from a CDN only when a tool needs them.

const cache = {};

function loadScript(src) {
  if (cache[src]) return cache[src];
  cache[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = () => {
      delete cache[src];
      reject(new Error('Could not load a required component. Check your internet connection.'));
    };
    document.head.appendChild(s);
  });
  return cache[src];
}

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs';

export async function loadJsPDF() {
  await loadScript(`${CDN}/jspdf/2.5.1/jspdf.umd.min.js`);
  return window.jspdf.jsPDF;
}

export async function loadJSZip() {
  await loadScript(`${CDN}/jszip/3.10.1/jszip.min.js`);
  return window.JSZip;
}

export async function loadPdfJs() {
  await loadScript(`${CDN}/pdf.js/3.11.174/pdf.min.js`);
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc = `${CDN}/pdf.js/3.11.174/pdf.worker.min.js`;
  return lib;
}
