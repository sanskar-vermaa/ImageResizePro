// Format-conversion landing pages ("png to jpg", "webp to jpg" ...).

const NAMES = { jpg: 'JPG', png: 'PNG', webp: 'WebP', avif: 'AVIF', bmp: 'BMP', ico: 'ICO', gif: 'GIF' };

const WHY = {
  jpg: 'JPG is the most widely supported photo format — it opens everywhere and is accepted by almost every website and form.',
  png: 'PNG is lossless and supports transparent backgrounds, which makes it ideal for logos, screenshots and graphics.',
  webp: 'WebP is a modern format from Google that is typically 25–35% smaller than JPG at the same quality, which makes websites load faster.',
  avif: 'AVIF is the newest web image format and often produces the smallest files of all.',
  bmp: 'BMP is an uncompressed bitmap format used by older Windows software and some printers.',
  ico: 'ICO is the icon format used for website favicons and Windows application icons.',
};

export function convertPage(from, to) {
  const F = NAMES[from];
  const T = NAMES[to];
  return {
    slug: `${from}-to-${to}`,
    tool: 'convert',
    options: { to },
    category: 'convert',
    icon: 'convert',
    name: `${F} to ${T}`,
    title: `${F} to ${T} Converter – Convert ${F} to ${T} Online Free`,
    description: `Convert ${F} to ${T} online in seconds. Free ${F} to ${T} converter with batch support and no quality loss. No upload — works privately in your browser.`,
    h1: `${F} to ${T} Converter`,
    intro: `Turn ${F} images into ${T} instantly. Convert one file or hundreds at once — free, unlimited and private.`,
    howTitle: `convert ${F} to ${T}`,
    steps: [
      `Select or drag your ${F} files into the box above.`,
      `${T} is already chosen as the output format.`,
      'Click "Convert images".',
      `Download your ${T} files one by one or all together as a ZIP.`,
    ],
    article: [
      {
        h: `Why convert ${F} to ${T}?`,
        p: [WHY[to] || '', `Our converter decodes the ${F} image and re-encodes it as ${T} directly on your device, so the conversion is quick and your images stay private.`].filter(Boolean),
      },
    ],
    faq: [
      { q: `How do I convert ${F} to ${T}?`, a: `Upload your ${F} images, make sure ${T} is selected and click Convert. Your ${T} files are ready to download immediately.` },
      { q: 'Is there a file limit?', a: 'No. You can convert as many files as you want, completely free.' },
      { q: 'Will I lose quality?', a: to === 'png' || to === 'bmp' ? `${T} is lossless, so the converted image keeps all the detail of the original.` : `At the default 92% quality the difference is not visible. You can raise the quality slider up to 100%.` },
      { q: 'What happens to transparent backgrounds?', a: ['jpg', 'bmp'].includes(to) ? `${T} does not support transparency, so transparent areas are filled with white (you can pick another colour in Advanced options).` : `${T} supports transparency, so transparent areas are kept.` },
    ],
    related: ['image-converter', `${to}-to-${from}`, 'compress-image', 'image-to-pdf'],
  };
}

export const CONVERT_PAGES = [
  {
    slug: 'image-converter',
    tool: 'convert',
    category: 'convert',
    icon: 'convert',
    name: 'Image Converter',
    title: 'Image Converter – Convert JPG, PNG, WebP, AVIF, ICO Free',
    description: 'Free online image converter. Convert images to JPG, PNG, WebP, AVIF, BMP or ICO in bulk. Fast, no sign-up, no upload — 100% private.',
    h1: 'Image Converter',
    intro: 'Convert photos between JPG, PNG, WebP, AVIF, BMP and ICO in one click. Batch convert many files and download them as a ZIP.',
    howTitle: 'convert an image',
    steps: [
      'Add your images with "Select files", drag and drop, or paste (Ctrl+V).',
      'Choose the output format: JPG, PNG, WEBP, AVIF, BMP or ICO.',
      'Click "Convert images".',
      'Download the converted files.',
    ],
    faq: [
      { q: 'Which format should I choose?', a: 'JPG for photos that must work everywhere, PNG for graphics or transparency, WebP for the smallest files on websites, and ICO for favicons.' },
      { q: 'Can I convert HEIC iPhone photos?', a: 'Only if your browser can open HEIC (Safari on Mac and iPhone can). Otherwise set your iPhone camera to "Most Compatible" to save JPG.' },
      { q: 'Is it free?', a: 'Yes, completely free with no limits or watermarks.' },
    ],
    related: ['png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'compress-image'],
  },
  convertPage('png', 'jpg'),
  convertPage('jpg', 'png'),
];
