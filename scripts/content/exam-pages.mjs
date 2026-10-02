// Exam / government-form photo & signature pages (very high search volume in India).

const faqBase = [
  { q: 'Is this the exact size for my exam?', a: 'The presets cover the most common requirements, but every recruitment notice can differ. Read the photo and signature rules in your official notification and enter those numbers in the Width, Height, Min KB and Max KB boxes.' },
  { q: 'How do I get the size between minimum and maximum KB?', a: 'Just enter both values. The tool automatically chooses the JPG quality so the file lands inside your range.' },
  { q: 'My face is not in the centre — what do I do?', a: 'Drag the photo inside the preview to move it, and use the Zoom slider to make the face bigger.' },
  { q: 'Can I add my name and date below the photo?', a: 'Yes. Open "Name & date / more options", tick "Add name & date below photo" and type your name.' },
  { q: 'Is my photo safe?', a: 'Yes. Everything happens inside your browser; your photo is never uploaded to any server.' },
];

export const EXAM_PAGES = [
  {
    slug: 'photo-signature-resizer',
    tool: 'exam-photo',
    category: 'resize',
    icon: 'id',
    name: 'Photo & Signature Resizer',
    title: 'Photo & Signature Resizer for Exam Forms – 20KB to 50KB',
    description: 'Resize photo and signature for SSC, UPSC, banking, railway and state exam forms. Set exact pixels and KB range (e.g. 20–50 KB) in one click. Free & private.',
    h1: 'Photo & Signature Resizer for Online Forms',
    intro: 'Get your photo and signature to the exact pixel size and KB range required by online application forms — in one step, right on your phone.',
    howTitle: 'resize a photo and signature for exam forms',
    steps: [
      'Upload your photo or a scanned signature.',
      'Choose a preset or type the width, height, minimum KB and maximum KB from your notification.',
      'Drag the photo to centre your face and adjust Zoom if needed.',
      'Click "Resize & download" — you get a JPG that matches the size rules.',
    ],
    article: [
      {
        h: 'Why online forms reject photos',
        p: [
          'Most recruitment and admission portals check three things: file type (usually JPG), dimensions in pixels or centimetres, and file size in KB. A photo straight from a phone camera is usually 2–5 MB and thousands of pixels wide, so it fails all of them.',
          'This tool crops your photo to the right shape, resizes it to the exact pixel size and finds a JPG quality that keeps the file inside the minimum and maximum KB limits — all at once.',
        ],
      },
      {
        h: 'Tips for a photo that gets accepted',
        p: [
          'Use a plain white or light background, face the camera directly, and make sure your face fills most of the frame. For signatures, sign with a black pen on white paper and photograph it in good light.',
        ],
      },
    ],
    faq: faqBase,
    related: ['signature-resizer', 'passport-size-photo-maker', 'compress-image-to-20kb', 'compress-image-to-50kb'],
  },
  {
    slug: 'signature-resizer',
    tool: 'exam-photo',
    options: { preset: 'sign-cm' },
    category: 'resize',
    icon: 'signature',
    name: 'Signature Resizer',
    title: 'Signature Resizer Online – Resize Signature to 10KB–20KB',
    description: 'Resize your signature for online forms: 4×2 cm or 140×60 px, 10–20 KB JPG. Crop, resize and compress a scanned signature in one click. Free.',
    h1: 'Signature Resizer (10–20 KB)',
    intro: 'Resize a photo of your signature to the exact size required by exam and job application forms. The common 10–20 KB signature preset is already selected.',
    howTitle: 'resize a signature',
    steps: [
      'Sign on white paper with a black or blue pen and take a clear photo.',
      'Upload it here — the 10–20 KB signature preset is already set.',
      'Zoom and drag so the signature fills the box.',
      'Click "Resize & download".',
    ],
    faq: faqBase,
    related: ['photo-signature-resizer', 'compress-image-to-20kb', 'compress-image-to-10kb'],
  },
  {
    slug: 'passport-size-photo-maker',
    tool: 'exam-photo',
    options: { preset: 'photo-cm' },
    category: 'resize',
    icon: 'id',
    name: 'Passport Size Photo Maker',
    title: 'Passport Size Photo Maker Online – 3.5×4.5 cm Photo Free',
    description: 'Make a passport size photo (3.5×4.5 cm) online for free. Crop, centre your face and save a 20–50 KB JPG for online applications. No upload needed.',
    h1: 'Passport Size Photo Maker',
    intro: 'Create a 3.5×4.5 cm passport-size photo from any picture. Centre your face, add your name and date if required, and download a form-ready JPG.',
    howTitle: 'make a passport size photo',
    steps: [
      'Upload a front-facing photo with a plain background.',
      'Drag and zoom so your face and shoulders fill the frame.',
      'Optionally add your name and date below the photo.',
      'Click "Resize & download".',
    ],
    faq: faqBase,
    related: ['photo-signature-resizer', 'signature-resizer', 'compress-image-to-50kb'],
  },
];
