// About, contact and legal pages — required for Google AdSense approval and user trust.
import { SITE } from '../site.config.mjs';

const updated = 'October 2026';

export const STATIC_PAGES = [
  {
    slug: 'about',
    title: `About ${SITE.name} – Free & Private Online Image Tools`,
    description: `Learn about ${SITE.name}, a free collection of private, in-browser image tools for compressing, resizing and converting photos.`,
    h1: `About ${SITE.name}`,
    html: `
      <p>${SITE.name} is a free collection of online image tools built to make everyday photo tasks quick and painless — compressing a photo to fit an upload limit, resizing a picture for social media, preparing a photo and signature for an online application form, or turning a stack of images into a single PDF.</p>
      <h2>Our mission</h2>
      <p>Most online image converters upload your files to their servers. We think that is unnecessary — and risky when the files are ID cards, certificates or family photos. ${SITE.name} does all of the processing directly in your web browser, on your own device. Your images are never uploaded, stored or seen by anyone else.</p>
      <h2>What makes us different</h2>
      <ul>
        <li><strong>Private by design:</strong> files stay on your device.</li>
        <li><strong>Free forever:</strong> no sign-up, no watermarks, no daily limits.</li>
        <li><strong>Simple:</strong> every tool works in three steps — upload, adjust, download.</li>
        <li><strong>Fast on any device:</strong> designed for phones first, and works offline once loaded.</li>
      </ul>
      <h2>Who builds it</h2>
      <p>${SITE.name} is created and maintained by ${SITE.owner}, a software developer from India. The site is supported by advertising, which keeps every tool free for everyone.</p>
      <p>Have an idea for a new tool or found a problem? Please <a href="../contact/">get in touch</a>.</p>`,
  },
  {
    slug: 'contact',
    title: `Contact Us – ${SITE.name}`,
    description: `Contact the ${SITE.name} team with questions, feedback, bug reports or tool suggestions.`,
    h1: 'Contact us',
    html: `
      <p>We would love to hear from you — whether you have a question, found a bug, or want to suggest a new tool.</p>
      <p><strong>E-mail:</strong> <a href="mailto:${SITE.email}">${SITE.email}</a></p>
      <p>We usually reply within 2 working days.</p>
      <h2>Before you write</h2>
      <ul>
        <li>Because all processing happens in your browser, we never receive your images — so we cannot recover files for you.</li>
        <li>If a tool is not working, please tell us which browser and device you are using.</li>
      </ul>`,
  },
  {
    slug: 'privacy-policy',
    title: `Privacy Policy – ${SITE.name}`,
    description: `How ${SITE.name} handles your data. Your images are processed locally in your browser and never uploaded.`,
    h1: 'Privacy Policy',
    html: `
      <p><em>Last updated: ${updated}</em></p>
      <p>This Privacy Policy explains how ${SITE.name} ("we", "us") at ${SITE.url} handles information when you use our website.</p>
      <h2>1. Your images and files</h2>
      <p>All image and PDF processing on ${SITE.name} happens locally in your web browser. The files you select are <strong>not uploaded</strong> to our servers, are not stored by us, and are not shared with anyone. When you close the page, they are gone from the browser's memory.</p>
      <h2>2. Information collected automatically</h2>
      <p>Like most websites, our hosting provider may record standard server logs (such as IP address, browser type, pages visited and time of visit) for security and performance. We may also use analytics tools such as Google Analytics to understand how visitors use the site in aggregate.</p>
      <h2>3. Cookies and advertising</h2>
      <p>We use Google AdSense to show advertisements. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</p>
      <ul>
        <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
        <li>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>. Alternatively, you can opt out of some third-party vendors' use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener" target="_blank">www.aboutads.info</a>.</li>
        <li>Learn more about <a href="https://policies.google.com/technologies/partner-sites" rel="nofollow noopener" target="_blank">how Google uses information from sites that use its services</a>.</li>
      </ul>
      <p>We also store a small preference in your browser's local storage to remember whether you chose light or dark mode.</p>
      <h2>4. Children's privacy</h2>
      <p>Our website is not directed at children under 13, and we do not knowingly collect personal information from children.</p>
      <h2>5. Your rights</h2>
      <p>Depending on where you live (for example under the GDPR in Europe or the DPDP Act in India), you may have rights to access, correct or delete personal data. Because we do not collect your files or create accounts, we hold very little data about you. Contact us at <a href="mailto:${SITE.email}">${SITE.email}</a> with any request.</p>
      <h2>6. Changes</h2>
      <p>We may update this policy from time to time. The "Last updated" date above shows when it was last changed.</p>
      <h2>7. Contact</h2>
      <p>Questions about this policy? E-mail <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
  },
  {
    slug: 'terms',
    title: `Terms of Use – ${SITE.name}`,
    description: `Terms and conditions for using ${SITE.name} free online image tools.`,
    h1: 'Terms of Use',
    html: `
      <p><em>Last updated: ${updated}</em></p>
      <p>By using ${SITE.name} you agree to these terms. If you do not agree, please do not use the website.</p>
      <h2>Use of the tools</h2>
      <p>The tools are provided free of charge for personal and commercial use. You are responsible for the files you process and must have the right to use them. Do not use the website for any unlawful purpose.</p>
      <h2>No warranty</h2>
      <p>The website is provided "as is" without warranties of any kind. While we work hard to make every tool accurate, we do not guarantee that results will meet the requirements of any particular form, exam or website. Always check official requirements before submitting documents.</p>
      <h2>Limitation of liability</h2>
      <p>To the fullest extent permitted by law, ${SITE.name} and its owner are not liable for any loss or damage arising from the use of the website, including rejected applications or lost files. Keep a copy of your original files.</p>
      <h2>Intellectual property</h2>
      <p>The website design, text and code are owned by ${SITE.owner}. Your images remain yours — we never receive them.</p>
      <h2>Changes</h2>
      <p>We may change these terms at any time. Continued use of the website means you accept the updated terms.</p>`,
  },
  {
    slug: 'disclaimer',
    title: `Disclaimer – ${SITE.name}`,
    description: `Disclaimer for ${SITE.name}: general information, exam photo presets, and advertising.`,
    h1: 'Disclaimer',
    html: `
      <p>The information and tools on ${SITE.name} are provided for general use only.</p>
      <h2>Exam and form presets</h2>
      <p>Photo and signature presets reflect common requirements, but every exam board, government department and employer sets its own rules, and these can change. ${SITE.name} is not affiliated with SSC, UPSC, IBPS, any state commission or any other organisation. Always confirm the exact size, dimensions and format in the official notification.</p>
      <h2>Advertising</h2>
      <p>This website displays advertisements to stay free. We are not responsible for the content of third-party ads or the websites they link to.</p>
      <h2>External links</h2>
      <p>Links to other websites are provided for convenience. We do not control and are not responsible for their content.</p>`,
  },
];
