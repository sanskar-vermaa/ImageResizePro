<div align="center">

<img src="assets/img/logo.svg" width="84" alt="ImageResizePro logo" />

# ImageResizePro

**Free, fast and private online image tools — everything runs in your browser, nothing is uploaded.**

Compress to 20 KB · Resize for exam forms · JPG to PDF · PNG to JPG · HEIC to JPG · Crop · Watermark · and more

**🌐 Live site: [imageresizepro.vercel.app](https://imageresizepro.vercel.app/)**

![ImageResizePro home page](docs/screenshots/home.png)

</div>

---

## Table of contents

- [Why ImageResizePro](#why-imageresizepro)
- [All tools](#all-tools)
- [Screenshots](#screenshots)
  - [Compress](#-compress-images)
  - [Exam photo & signature](#-photo--signature-for-exam-forms)
  - [Convert & PDF](#-convert--pdf)
  - [Edit](#-edit)
  - [Utilities](#-utilities)
  - [Mobile & dark mode](#-mobile--dark-mode)
  - [SEO content on every page](#-seo-content-on-every-page)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Deploy free on GitHub Pages](#deploy-free-on-github-pages)
- [Custom domain, Search Console & AdSense](#custom-domain-search-console--adsense)
- [License](#license)

---

## Why ImageResizePro

| | |
| --- | --- |
| 🔒 **100% private** | Photos are processed on your own device. No uploads, no servers, no accounts. |
| ⚡ **Easy** | Every tool is **upload → one button → download**. Extra settings stay hidden under *Advanced options*. |
| 📦 **Batch** | Process many images at once and download them together as a ZIP. |
| 📱 **Mobile-first** | Works great on Android and iPhone, with light & dark themes. |
| 📴 **Works offline** | Installable PWA — once loaded, tools keep working without internet. |
| 🔎 **SEO-ready** | 54 keyword-focused pages with structured data, sitemap and FAQs. |
| 💰 **AdSense-ready** | Ad slots on every page plus About, Contact, Privacy, Terms and Disclaimer pages. |

## All tools

| Category | Tools |
| --- | --- |
| **Compress** | Compress Image (by quality or exact KB) · Compress to 10 / 20 / 30 / 50 / 100 / 200 / 500 KB |
| **Resize** | Resize Image (pixels, %, presets) · Instagram · YouTube thumbnail · WhatsApp DP · Facebook · LinkedIn banner |
| **Exam forms** | Photo & Signature Resizer (exact pixels + KB range) · Signature Resizer · Passport Size Photo Maker |
| **Convert** | Image Converter · PNG ↔ JPG · WebP → JPG/PNG · JPG/PNG → WebP · PNG/JPG → ICO · AVIF → JPG · HEIC → JPG/PNG |
| **PDF** | Image to PDF · JPG to PDF · PNG to PDF · PDF to JPG · PDF to PNG |
| **Edit** | Crop · Circle Crop · Rotate · Flip · Watermark (text / logo / tiled) · Photo Filters · Black & White · Blur · Merge Images |
| **Utilities** | Color Picker from Image · Image ⇄ Base64 · Favicon Generator · Remove EXIF / GPS data |

---

## Screenshots

### 🗜️ Compress images

Compress many photos at once and see exactly how much space each one saved.

![Compress images with batch results](docs/screenshots/compress.png)

Pages like **Compress Image to 20KB** come with the target size already set — upload and press one button.

![Compress image to 20KB](docs/screenshots/compress-20kb.png)

### 🪪 Photo & signature for exam forms

Set exact width, height and **minimum–maximum KB** in one step. Drag to centre the face, zoom, and optionally add **name & date** below the photo.

![Photo and signature resizer for exam forms](docs/screenshots/exam-photo.png)

| Signature resizer (10–20 KB) | Resize by pixels or presets |
| --- | --- |
| ![Signature resizer](docs/screenshots/signature.png) | ![Resize image](docs/screenshots/resize.png) |

### 🔄 Convert & PDF

| Convert to JPG / PNG / WebP / AVIF / BMP / ICO | Combine images into one PDF |
| --- | --- |
| ![Image converter](docs/screenshots/converter.png) | ![Image to PDF](docs/screenshots/image-to-pdf.png) |

Turn every page of a PDF into a JPG or PNG:

![PDF to JPG](docs/screenshots/pdf-to-jpg.png)

### ✂️ Edit

| Crop with ratio presets | Circle crop (transparent PNG) |
| --- | --- |
| ![Crop image](docs/screenshots/crop.png) | ![Circle crop](docs/screenshots/circle-crop.png) |

| Filters with live preview | Text / logo watermark |
| --- | --- |
| ![Photo filters](docs/screenshots/filters.png) | ![Add watermark](docs/screenshots/watermark.png) |

Merge photos side by side, stacked or as a grid:

![Merge images](docs/screenshots/merge.png)

### 🧰 Utilities

| Color picker + palette | Favicon generator |
| --- | --- |
| ![Color picker from image](docs/screenshots/color-picker.png) | ![Favicon generator](docs/screenshots/favicon.png) |

See and remove hidden EXIF data such as **GPS location** before sharing photos:

![Remove EXIF data](docs/screenshots/remove-exif.png)

### 📱 Mobile & dark mode

![Mobile screenshots](docs/screenshots/mobile.png)

![Dark mode](docs/screenshots/home-dark.png)

### 📝 SEO content on every page

Each tool page has a how-to guide, feature list, FAQ (with `FAQPage` schema) and related-tool links.

<img src="docs/screenshots/seo-content.png" width="560" alt="SEO content on a tool page" />

---

## How it works

- **No backend.** Everything uses browser APIs (Canvas, File, Blob) on the visitor's device.
- **Libraries are self-hosted** in `assets/vendor/` — PDF.js (PDF → image), jsPDF (image → PDF), JSZip (ZIP downloads), heic2any (iPhone HEIC photos). They load only on the pages that need them.
- **Static site generator** — `scripts/build.mjs` turns the content files in `scripts/content/` into one HTML page per tool, with:
  - unique `<title>`, meta description, canonical URL and Open Graph tags
  - JSON-LD: `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`
  - internal links to related tools
  - `sitemap.xml`, `robots.txt` and a `404.html`
- **Tested** — unit tests for the image math plus SEO checks (title/description length, unique slugs, every page has steps and FAQ).

## Project structure

```
assets/
  css/style.css          # design system & components
  js/main.js             # theme, menu, search, lazy tool loader, offline support
  js/core/               # shared modules (dropzone, batch UI, encoders, EXIF…)
  js/tools/              # one module per tool
  vendor/                # self-hosted libraries (+ licenses)
  img/                   # logo, icons, social share image
docs/screenshots/        # images used in this README
scripts/
  site.config.mjs        # ← site URL, AdSense, Analytics, Search Console
  build.mjs              # static page generator
  layout.mjs             # shared HTML layout
  content/*.mjs          # page content (titles, steps, FAQs…)
tests/                   # unit + SEO content tests
<slug>/index.html        # generated pages (committed so GitHub Pages can serve them)
```

## Run locally

Needs Node.js 18+ — there are no dependencies to install.

```bash
npm run build   # regenerate all pages, sitemap.xml and robots.txt
npm test        # run unit and content tests
npm run serve   # preview at http://localhost:5173
```

After changing anything in `scripts/`, run `npm run build` and commit the regenerated HTML.

## Deploy free on GitHub Pages

1. Open the repository → **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: Deploy from a branch**, branch **`main`**, folder **`/ (root)`** → **Save**.
3. After 1–2 minutes the site is live at **https://sanskar-vermaa.github.io/ImageResizePro/**.

## Custom domain, Search Console & AdSense

1. **Buy a domain** (e.g. `imageresizepro.com`) → **Settings → Pages → Custom domain** → add the DNS records GitHub shows → tick **Enforce HTTPS**.
2. Change `url` in `scripts/site.config.mjs` to the new domain, then `npm run build`, commit and push.
3. **Google Search Console** — add the site, paste the verification token into `googleVerification`, rebuild, push, and submit `sitemap.xml`.
4. **Google AdSense** — apply with your own domain (AdSense does not approve `github.io` addresses). Once approved, set `adsenseClient` (and optional `adSlots`), add the `ads.txt` file AdSense gives you to the repository root, rebuild and push.
5. **Grow traffic** — add more landing pages in `scripts/content/*.mjs`. Pages that match exact searches ("compress image to 20kb", "signature resizer") bring the most visitors.

## License

Code: MIT © 2026 Sanskar Verma. Third-party libraries in `assets/vendor/` keep their own licenses (see each folder).
