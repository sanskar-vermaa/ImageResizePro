// Utility tool pages.

export const UTILITY_PAGES = [
  {
    slug: 'color-picker-from-image',
    tool: 'color-picker',
    category: 'utility',
    icon: 'palette',
    name: 'Color Picker from Image',
    title: 'Color Picker from Image – Get HEX, RGB Code Online Free',
    description: 'Pick colours from any image online. Get HEX, RGB and HSL codes with one click and extract the dominant colour palette of a photo. Free and private.',
    h1: 'Color Picker from Image',
    intro: 'Find the exact colour code of any pixel in a photo, logo or screenshot. Click to copy HEX, RGB or HSL and see the image’s main colour palette.',
    howTitle: 'pick a colour from an image',
    steps: ['Upload or paste an image.', 'Move your mouse (or finger) over the image to preview colours.', 'Click to pick a colour — the HEX code is copied automatically.', 'Click any palette swatch to copy it too.'],
    faq: [
      { q: 'How do I find the HEX code of a colour in a picture?', a: 'Upload the picture and click the colour. The HEX code (like #4F46E5) is shown and copied to your clipboard.' },
      { q: 'What is the palette?', a: 'The palette shows the most common distinct colours in your image — handy for designing matching graphics.' },
    ],
    related: ['image-to-base64', 'photo-filters', 'image-converter'],
  },
];

UTILITY_PAGES.push(
  {
    slug: 'image-to-base64',
    tool: 'base64',
    category: 'utility',
    icon: 'code',
    name: 'Image to Base64',
    title: 'Image to Base64 Converter – Encode Image to Data URI Online',
    description: 'Convert images to Base64 online. Get a data URI, raw Base64, HTML <img> tag or CSS background code. Also decode Base64 back to an image. Free.',
    h1: 'Image to Base64 Converter',
    intro: 'Encode any image as Base64 to embed it directly in HTML, CSS, JSON or e-mails — or paste Base64 to turn it back into a picture.',
    howTitle: 'convert an image to Base64',
    steps: ['Upload an image (small icons and logos work best).', 'Choose the output: Data URI, raw Base64, <img> tag or CSS.', 'Click Copy and paste the code where you need it.'],
    faq: [
      { q: 'Why is the Base64 bigger than the image?', a: 'Base64 represents binary data using text, which makes it about 33% larger. Use it for small images only.' },
      { q: 'How do I convert Base64 back to an image?', a: 'Switch to "Base64 → Image", paste the string and click "Show image", then Download.' },
    ],
    related: ['base64-to-image', 'color-picker-from-image', 'compress-image'],
  },
  {
    slug: 'base64-to-image',
    tool: 'base64',
    options: { mode: 'decode' },
    category: 'utility',
    icon: 'code',
    name: 'Base64 to Image',
    title: 'Base64 to Image Converter – Decode Base64 to PNG/JPG Online',
    description: 'Decode Base64 strings and data URIs to images online. Preview the image and download it as PNG, JPG, GIF or WebP. Free and works offline.',
    h1: 'Base64 to Image Decoder',
    intro: 'Paste a Base64 string or a data:image URI to preview the picture and download it as a normal image file.',
    howTitle: 'convert Base64 to an image',
    steps: ['Paste your Base64 string or data URI into the box.', 'Click "Show image" to preview it.', 'Click Download to save the file.'],
    faq: [{ q: 'Do I need the "data:image/png;base64," prefix?', a: 'No. The tool detects JPG, PNG, GIF and WebP automatically from the data itself.' }],
    related: ['image-to-base64', 'image-converter'],
  },
);

UTILITY_PAGES.push({
  slug: 'favicon-generator',
  tool: 'favicon',
  category: 'utility',
  icon: 'star',
  name: 'Favicon Generator',
  title: 'Favicon Generator – Create favicon.ico & App Icons from Image',
  description: 'Generate a complete favicon package from any image: favicon.ico, 16/32px PNGs, Apple touch icon, Android icons, web manifest and HTML code. Free.',
  h1: 'Favicon Generator',
  intro: 'Upload your logo and get every icon your website needs — favicon.ico, PNG favicons, Apple touch icon, Android icons and the HTML code — in one ZIP.',
  howTitle: 'create a favicon',
  steps: [
    'Upload your logo — a square PNG with a transparent background works best.',
    'Choose a transparent or coloured background and the shape.',
    'Click "Download favicon package".',
    'Unzip the files into your website’s root folder and paste the HTML code into the <head>.',
  ],
  faq: [
    { q: 'What sizes are included?', a: 'favicon.ico (16, 32, 48 px), favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180 px), and Android icons at 192 and 512 px.' },
    { q: 'Do I still need favicon.ico?', a: 'Yes — some browsers and tools still request /favicon.ico, so the package includes it alongside the PNG icons.' },
  ],
  related: ['png-to-ico', 'resize-image', 'image-to-base64'],
});
