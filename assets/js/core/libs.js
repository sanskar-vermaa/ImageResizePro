// Lazy-load bundled third-party libraries only when a tool needs them.
// Libraries are self-hosted in /assets/vendor so the site works offline and without third-party CDNs.

const cache = {};
const vendor = (path) => new URL(`../../vendor/${path}`, import.meta.url).href;

function loadScript(src) {
  if (cache[src]) return cache[src];
  cache[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      delete cache[src];
      reject(new Error('Could not load a required component. Please refresh the page.'));
    };
    document.head.appendChild(s);
  });
  return cache[src];
}

export async function loadJsPDF() {
  await loadScript(vendor('jspdf/jspdf.umd.min.js'));
  return window.jspdf.jsPDF;
}

export async function loadJSZip() {
  await loadScript(vendor('jszip/jszip.min.js'));
  return window.JSZip;
}

export async function loadPdfJs() {
  await loadScript(vendor('pdfjs/pdf.min.js'));
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc = vendor('pdfjs/pdf.worker.min.js');
  return lib;
}

export async function loadHeic2any() {
  await loadScript(vendor('heic2any/heic2any.min.js'));
  return window.heic2any;
}
