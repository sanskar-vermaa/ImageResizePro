// Programmatic landing pages: "compress image to N KB".
// These match very high-volume searches from people filling online forms.

const USE = {
  10: 'signatures on government and university application forms',
  20: 'signatures and passport photos for SSC, UPSC, banking and state exam forms',
  30: 'photos for job portals and scholarship applications',
  50: 'passport-size photos for online exam and visa forms',
  100: 'profile pictures, resumes and document uploads',
  200: 'website images, e-mail attachments and online portals',
  500: 'high-quality photos that still upload fast',
};

export function kbPage(kb) {
  return {
    slug: `compress-image-to-${kb}kb`,
    tool: 'compress',
    options: { targetKB: kb },
    category: 'compress',
    icon: 'compress',
    name: `Compress Image to ${kb}KB`,
    title: `Compress Image to ${kb}KB Online Free – JPG Under ${kb} KB`,
    description: `Reduce photo size to ${kb}KB or less in one click. Compress JPG, PNG and WebP to ${kb} KB for online forms, exams and uploads. Free, fast and private.`,
    h1: `Compress Image to ${kb}KB`,
    intro: `Make any photo ${kb} KB or smaller in seconds — ideal for ${USE[kb] || 'online forms and uploads'}. The target size is already set for you.`,
    howTitle: `compress an image to ${kb}KB`,
    steps: [
      'Upload your photo by clicking "Select files" or dragging it onto the box.',
      `The target is already set to ${kb} KB — just press "Compress images".`,
      `Check the new size (it will be ${kb} KB or less) and click Download.`,
    ],
    article: [
      {
        h: `Why compress a photo to ${kb}KB?`,
        p: [
          `Online application forms often reject images larger than ${kb} KB. Instead of guessing quality settings in a photo editor, this page finds the highest quality that still fits under ${kb} KB automatically.`,
          'If the photo is very large, the tool first tries lowering the JPG quality, and only reduces the pixel dimensions when that is not enough — so your picture stays as sharp as possible.',
        ],
      },
    ],
    faq: [
      { q: `How do I reduce a photo to exactly ${kb}KB?`, a: `Upload the photo and press Compress. The tool automatically searches for the best quality that keeps the file at or just under ${kb} KB.` },
      { q: 'Will my photo become blurry?', a: 'The tool keeps the highest possible quality for the size limit. Very small limits on very large photos may reduce the dimensions slightly, which is normal and keeps the photo clear.' },
      { q: 'Can I change the size limit?', a: 'Yes. Open the settings panel and type any value in the "Target size (KB)" box.' },
      { q: 'Is my photo uploaded anywhere?', a: 'No. Compression happens inside your browser and your photo never leaves your device.' },
    ],
    related: ['compress-image', 'photo-signature-resizer', 'resize-image'],
  };
}

export const KB_SIZES = [20, 50];
export const KB_PAGES = KB_SIZES.map(kbPage);
