// Resize landing pages.

const common = {
  tool: 'resize',
  category: 'resize',
  icon: 'resize',
};

export const RESIZE_PAGES = [
  {
    ...common,
    slug: 'resize-image',
    name: 'Resize Image',
    title: 'Resize Image Online Free – Change Image Size in Pixels',
    description: 'Resize images online for free. Change width and height in pixels or percentage, keep aspect ratio, and batch resize JPG, PNG and WebP. No upload needed.',
    h1: 'Resize Image Online',
    intro: 'Change the width and height of any picture in pixels or percent. Keep the aspect ratio, crop to an exact size, or pick a ready-made social media preset.',
    howTitle: 'resize an image',
    steps: [
      'Upload one or more images using "Select files" or drag and drop.',
      'Type the new width or height — the other side updates automatically to keep proportions.',
      'Or switch to "Percentage" to scale all images by the same amount.',
      'Click "Resize images" and download your resized photos.',
    ],
    article: [
      {
        h: 'Resize without losing quality',
        p: [
          'ImageResizePro uses high-quality resampling, so photos stay sharp when you make them smaller. Making an image much bigger than its original size cannot add real detail, so for best results resize down rather than up.',
          'Need an exact size like 1080×1080 for Instagram? Choose a preset and the image is filled and centre-cropped to that size, or open Advanced options to add padding instead of cropping.',
        ],
      },
    ],
    faq: [
      { q: 'How do I resize an image without stretching it?', a: 'Keep "Keep aspect ratio" ticked and enter only the width (or height). The other side is calculated for you.' },
      { q: 'Can I resize many photos at once?', a: 'Yes. Add as many images as you like — they are all resized with the same settings and you can download them as a ZIP.' },
      { q: 'What is the maximum size?', a: 'Up to 16,384 pixels on each side, which is the limit of most browsers.' },
      { q: 'Are my images uploaded?', a: 'No. Resizing happens on your device inside the browser.' },
    ],
    related: ['compress-image', 'crop-image', 'resize-image-for-instagram', 'photo-signature-resizer'],
  },
];
