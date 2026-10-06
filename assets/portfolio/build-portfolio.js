// Builds the Private Collectors & Hospitality Portfolio.
//   1. resizes the artworks in the browser (no image libraries needed) and inlines them as data-URIs
//      into private-portfolio.template.html  ->  gallery-dutch-art-private-portfolio.html (self-contained)
//   2. renders that HTML to A4 PDF with Playwright  ->  gallery-dutch-art-private-portfolio.pdf
// Local only: no external services. Usage (from the repo root):
//   NODE_PATH=<dir containing playwright-core> node assets/portfolio/build-portfolio.js [--screenshots <dir>]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(__dirname, 'private-portfolio.template.html');
const BUILT = path.join(__dirname, 'gallery-dutch-art-private-portfolio.html');
const PDF = path.join(__dirname, 'gallery-dutch-art-private-portfolio.pdf');
const shotsIdx = process.argv.indexOf('--screenshots');
const SHOTS = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';

const IMAGES = {
  LOGO:          { file: 'assets/logo/gallery-dutch-art-logo-original-transparent.png', keepPng: true },
  ART_TULIP:     { file: 'assets/artworks/tulipomania-nocturne.jpg', w: 1000, q: 0.84 },
  ART_DELFT:     { file: 'assets/artworks/delft-flow.jpg', w: 1000, q: 0.84 },
  ART_AMSTERDAM: { file: 'assets/artworks/golden-hour-amsterdam.jpg', w: 1000, q: 0.84 },
  ART_PATTERN:   { file: 'assets/artworks/dutch-heritage-pattern.jpg', w: 900, q: 0.86 },
  ART_WINDMILL:  { file: 'assets/artworks/windmill-dusk.jpg', w: 1500, q: 0.82 },
  ART_CANAL:     { file: 'assets/artworks/canal-reflections-delft.jpg', w: 1500, q: 0.84 }
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message));

  await page.setContent('<!doctype html><meta charset="utf-8"><body></body>');
  const uris = {};
  for (const [key, spec] of Object.entries(IMAGES)) {
    const buf = fs.readFileSync(path.join(ROOT, spec.file));
    if (spec.keepPng) { uris[key] = 'data:image/png;base64,' + buf.toString('base64'); continue; }
    const src = 'data:image/jpeg;base64,' + buf.toString('base64');
    uris[key] = await page.evaluate(async ({ src, w, q }) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
      const h = Math.round(img.naturalHeight * w / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/jpeg', q);
    }, { src, w: spec.w, q: spec.q });
  }

  let html = fs.readFileSync(TEMPLATE, 'utf8');
  for (const [key, uri] of Object.entries(uris)) html = html.split('{{' + key + '}}').join(uri);
  const left = html.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error('unreplaced placeholders: ' + left.join(','));
  fs.writeFileSync(BUILT, html);

  await page.emulateMedia({ media: 'print' });
  await page.goto('file://' + BUILT);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    const handles = await page.$$('.page');
    for (let i = 0; i < handles.length; i++) {
      await handles[i].screenshot({ path: path.join(SHOTS, 'page-' + String(i + 1).padStart(2, '0') + '.png') });
    }
  }
  await page.pdf({ path: PDF, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('html', Math.round(fs.statSync(BUILT).size / 1024) + ' KB;', 'pdf', Math.round(fs.statSync(PDF).size / 1024) + ' KB');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
