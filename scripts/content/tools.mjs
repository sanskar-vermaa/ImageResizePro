// Tool catalogue. Every entry becomes its own SEO landing page at /<slug>/.
// `tool` is the JS module in assets/js/tools/, `options` are passed to it.
import { KB_PAGES } from './kb-pages.mjs';
import { RESIZE_PAGES } from './resize-pages.mjs';
import { CONVERT_PAGES } from './convert-pages.mjs';
import { PDF_PAGES } from './pdf-pages.mjs';
import { EXAM_PAGES } from './exam-pages.mjs';
import { EDIT_PAGES } from './edit-pages.mjs';
import { UTILITY_PAGES } from './utility-pages.mjs';

export const CATEGORIES = [
  { id: 'compress', label: 'Compress' },
  { id: 'resize', label: 'Resize' },
  { id: 'convert', label: 'Convert' },
  { id: 'pdf', label: 'PDF' },
  { id: 'edit', label: 'Edit' },
  { id: 'utility', label: 'Utilities' },
];

export const TOOLS = [
  {
    slug: 'compress-image',
    tool: 'compress',
    category: 'compress',
    icon: 'compress',
    name: 'Compress Image',
    title: 'Compress Image Online Free – Reduce JPG, PNG Size in KB',
    description: 'Compress JPG, PNG and WebP images online for free. Reduce image file size by up to 90% without losing quality. Batch compress, no upload, 100% private.',
    h1: 'Compress Image Online',
    intro: 'Reduce the file size of JPG, PNG and WebP photos in seconds — without visible loss of quality. Free, unlimited and private.',
    howTitle: 'compress an image',
    steps: [
      'Click "Select files" or drag and drop your images (you can add many at once).',
      'Choose "By quality" and move the slider, or pick "Target size" and enter the size in KB you need.',
      'Press "Compress images" and see how much space you saved for every file.',
      'Download each image, or click "Download all" to get them together in a ZIP file.',
    ],
    article: [
      {
        h: 'How does image compression work?',
        p: [
          'Most photos contain far more detail than the eye can see on a screen. Our compressor re-encodes your image with smart lossy compression that removes that invisible data, so a 4 MB phone photo can often become 400 KB while looking the same.',
          'For PNG and WebP images with transparency the tool automatically uses the WebP format, which keeps the transparent background and is usually much smaller than PNG.',
        ],
      },
      {
        h: 'Compress to an exact size in KB',
        p: [
          'Many websites, job portals and exam forms only accept photos under a size limit such as 20 KB, 50 KB or 100 KB. Switch to "Target size", type the limit, and the tool finds the best quality that fits — shrinking the dimensions only if it has to.',
        ],
      },
    ],
    faq: [
      { q: 'Is it safe to compress my photos here?', a: 'Yes. Your images are compressed directly in your browser and are never uploaded to a server, so nobody else can see them.' },
      { q: 'Will compression reduce image quality?', a: 'At the default 75% quality the difference is almost impossible to see, while the file is usually 60–80% smaller. You can raise the quality slider if you need more detail.' },
      { q: 'How many images can I compress at once?', a: 'There is no fixed limit. You can add dozens of images and download them all as a single ZIP file.' },
      { q: 'Which formats are supported?', a: 'JPG/JPEG, PNG, WebP, GIF (first frame) and BMP. You can output JPG, PNG or WebP.' },
      { q: 'Does it work on mobile?', a: 'Yes, ImageResizePro works in any modern browser on Android, iPhone, Windows, Mac and Linux.' },
    ],
    related: ['compress-image-to-50kb', 'compress-image-to-20kb', 'resize-image', 'image-converter'],
  },
  // @@end
  ...KB_PAGES,
  ...RESIZE_PAGES,
  ...CONVERT_PAGES,
  ...PDF_PAGES,
  ...EXAM_PAGES,
  ...EDIT_PAGES,
  ...UTILITY_PAGES,
];

// Variant pages are still indexed and linked from related tools, but kept off the home grid to keep it easy to scan.
const HIDE_ON_HOME = new Set([
  'compress-image-to-10kb', 'compress-image-to-30kb', 'compress-image-to-200kb', 'compress-image-to-500kb',
  'webp-to-png', 'jpg-to-webp', 'png-to-webp', 'jpg-to-ico', 'avif-to-jpg',
  'png-to-pdf', 'pdf-to-png',
  'youtube-thumbnail-resizer', 'resize-image-for-facebook', 'linkedin-banner-resizer',
  'base64-to-image', 'black-and-white-image', 'flip-image',
]);
const BADGES = { 'compress-image': 'Popular', 'image-to-pdf': 'Popular', 'photo-signature-resizer': 'Exam forms', 'compress-image-to-20kb': 'Exam forms' };

TOOLS.forEach((t) => {
  t.hideOnHome = HIDE_ON_HOME.has(t.slug);
  if (BADGES[t.slug]) t.badge = BADGES[t.slug];
});
