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

/** Social-media preset pages share one template. */
function presetPage({ slug, name, platform, size, uses }) {
  const [w, h] = size.split('x');
  return {
    ...common,
    slug,
    options: { preset: size, width: Number(w), height: Number(h), keepRatio: false, fit: 'cover' },
    name,
    title: `${name} Online Free – ${w}×${h} px`,
    description: `Resize photos for ${platform} in one click. Automatically crop and scale to ${w}×${h} pixels — the perfect size for ${uses}. Free and private.`,
    h1: name,
    intro: `Get the perfect ${w}×${h} pixel size for ${uses}. The size is already set — just upload and download.`,
    howTitle: `resize an image for ${platform}`,
    steps: [
      'Upload your photo (or several photos).',
      `The ${w}×${h} preset is already selected — your image will be filled and centre-cropped to fit.`,
      'Prefer no cropping? Open Advanced options and choose "Fit & pad with background".',
      'Click "Resize images" and download.',
    ],
    faq: [
      { q: `What size should images be for ${platform}?`, a: `${w}×${h} pixels is the recommended size for ${uses}.` },
      { q: 'Will my photo be cropped?', a: 'By default the photo fills the frame and the edges are trimmed evenly. You can switch to padding in Advanced options to keep the whole picture.' },
      { q: 'Does it reduce quality?', a: 'No visible quality loss — the image is resampled with high-quality smoothing and saved at 92% quality.' },
    ],
    related: ['resize-image', 'crop-image', 'compress-image'],
  };
}

RESIZE_PAGES.push(
  presetPage({ slug: 'resize-image-for-instagram', name: 'Resize Image for Instagram', platform: 'Instagram', size: '1080x1080', uses: 'Instagram square posts' }),
  presetPage({ slug: 'youtube-thumbnail-resizer', name: 'YouTube Thumbnail Resizer', platform: 'YouTube', size: '1280x720', uses: 'YouTube video thumbnails' }),
);
