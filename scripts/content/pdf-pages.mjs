// PDF-related landing pages.

const pdfFaq = (fmt) => [
  { q: `How do I convert ${fmt} to PDF?`, a: `Upload your ${fmt} files, arrange them in the order you want, choose a page size and click "Create PDF". The PDF downloads instantly.` },
  { q: 'Can I combine multiple images into one PDF?', a: 'Yes. Every image becomes one page of a single PDF. Drag the items or use the arrows to change the page order.' },
  { q: 'Will the PDF be large?', a: 'Images are optimised automatically. Lower "Image quality" in Advanced options for an even smaller PDF.' },
  { q: 'Is it safe for documents like ID cards and certificates?', a: 'Yes. The PDF is created in your browser and your files are never uploaded to any server.' },
  { q: 'Does it work on mobile?', a: 'Yes — you can pick photos straight from your phone gallery or camera.' },
];

const steps = (fmt) => [
  `Click "Select files" and choose your ${fmt} images (or drag them in).`,
  'Drag the pages or use the arrows to put them in the right order.',
  'Pick a page size (A4, Letter or Fit image), orientation and margin.',
  'Click "Create PDF" — your PDF downloads immediately.',
];

function imagePdfPage(slug, fmt, extra = {}) {
  return {
    slug,
    tool: 'image-to-pdf',
    category: 'pdf',
    icon: 'pdf',
    name: `${fmt} to PDF`,
    title: `${fmt} to PDF Converter – Convert ${fmt} to PDF Online Free`,
    description: `Convert ${fmt} to PDF online for free. Combine multiple ${fmt} images into one PDF, set page size and margins. No watermark, no upload, 100% private.`,
    h1: `${fmt} to PDF Converter`,
    intro: `Turn ${fmt} images into a clean PDF document in seconds. Merge many images into one file, reorder pages and choose A4 or Letter size.`,
    howTitle: `convert ${fmt} to PDF`,
    steps: steps(fmt),
    faq: pdfFaq(fmt),
    related: ['image-to-pdf', 'pdf-to-jpg', 'compress-image', 'jpg-to-pdf'],
    ...extra,
  };
}

export const PDF_PAGES = [
  imagePdfPage('image-to-pdf', 'Image', {
    name: 'Image to PDF',
    title: 'Image to PDF Converter – Convert Photos to PDF Online Free',
    description: 'Convert images to PDF free. Combine JPG, PNG, WebP photos into one PDF, reorder pages, choose A4/Letter. No watermark, no sign-up, works offline.',
    h1: 'Image to PDF Converter',
    intro: 'Combine photos, scans and screenshots into a single PDF. Reorder pages, choose A4 or Letter and download — no watermark, no sign-up.',
    article: [
      {
        h: 'Make a PDF from photos of documents',
        p: [
          'Need to submit marksheets, certificates, ID cards or receipts as one PDF? Take photos with your phone, upload them here, put them in order and create a single tidy PDF that is ready to e-mail or upload.',
          'Each image is centred on its page and scaled to fit inside the margins without being stretched. Choose "Fit image" if you want every page to be exactly the size of the picture.',
        ],
      },
    ],
  }),
  imagePdfPage('jpg-to-pdf', 'JPG'),
  imagePdfPage('png-to-pdf', 'PNG'),
];

function pdfImagePage(fmt, extra = {}) {
  const lower = fmt.toLowerCase();
  return {
    slug: `pdf-to-${lower}`,
    tool: 'pdf-to-image',
    options: { format: lower === 'png' ? 'png' : 'jpg' },
    category: 'pdf',
    icon: 'image',
    name: `PDF to ${fmt}`,
    title: `PDF to ${fmt} Converter – Convert PDF Pages to ${fmt} Free`,
    description: `Convert PDF to ${fmt} images online. Save every page of a PDF as a high-quality ${fmt}, or pick specific pages. Free, fast and private — no upload.`,
    h1: `PDF to ${fmt} Converter`,
    intro: `Extract each page of a PDF as a sharp ${fmt} image. Choose the quality, select pages, and download them one by one or as a ZIP.`,
    howTitle: `convert PDF to ${fmt}`,
    steps: [
      'Click "Select file" and choose your PDF.',
      `Choose ${fmt} and the output quality (High is recommended).`,
      'Optionally enter page numbers in Advanced options, e.g. 1-3, 5.',
      'Click "Convert to images" and download the pages.',
    ],
    faq: [
      { q: `How do I save a PDF page as ${fmt}?`, a: `Upload the PDF, click Convert, then press the download button under the page you want. Use "Download all" to get every page in a ZIP.` },
      { q: 'Can I convert only some pages?', a: 'Yes. Open Advanced options and type the pages, for example "2" or "1-4, 7".' },
      { q: 'Does it work with password-protected PDFs?', a: 'No — please remove the password first.' },
      { q: 'Is my PDF uploaded?', a: 'No. Pages are rendered inside your browser using PDF.js, so your document stays on your device.' },
    ],
    related: ['image-to-pdf', 'jpg-to-pdf', 'compress-image'],
    ...extra,
  };
}

PDF_PAGES.push(pdfImagePage('JPG'), pdfImagePage('PNG'));
