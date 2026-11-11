// Builds personalised hotel art proposals (A4 landscape PDF) and the matching outreach e-mail.
//   input : proposals/hotels/<slug>.json (one data sheet per hotel) + proposal.template.html
//   output: proposals/out/<slug>.pdf and proposals/out/<slug>-email.md
// Images are resized in the browser and inlined; fonts are embedded. Local only, no external services.
// Usage (repo root):  node proposals/build-proposals.js [slug ...] [--screenshots <dir>]
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('playwright-core')); }

const ROOT = path.resolve(__dirname, '..');
const HOTELS = path.join(__dirname, 'hotels');
const OUT = path.join(__dirname, 'out');
const TEMPLATE = path.join(__dirname, 'proposal.template.html');
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';

const args = process.argv.slice(2);
const shotsIdx = args.indexOf('--screenshots');
const SHOTS = shotsIdx > -1 ? args[shotsIdx + 1] : null;
const only = args.filter((a, i) => !a.startsWith('--') && !(shotsIdx > -1 && i === shotsIdx + 1));

const ART = {
  ART_CANAL:     { file: 'assets/artworks/canal-reflections-delft.jpg', title: 'Canal Reflections — Delft', shape: 'portrait' },
  ART_AMSTERDAM: { file: 'assets/artworks/golden-hour-amsterdam.jpg',   title: 'Golden Hour — Amsterdam',   shape: 'portrait' },
  ART_DELFT:     { file: 'assets/artworks/delft-flow.jpg',              title: 'Delft Flow',                shape: 'portrait' },
  ART_TULIP:     { file: 'assets/artworks/tulipomania-nocturne.jpg',    title: 'Tulipomania — Nocturne',    shape: 'portrait' },
  ART_PATTERN:   { file: 'assets/artworks/dutch-heritage-pattern.jpg',  title: 'Dutch Heritage Pattern',    shape: 'portrait' },
  ART_WINDMILL:  { file: 'assets/artworks/windmill-dusk.jpg',           title: 'Windmill at Dusk',          shape: 'portrait' },
  ART_PRISM:     { file: 'assets/artworks/prism-of-provenance.jpg',     title: 'Prism of Provenance',       shape: 'landscape' },
  ART_HOURGLASS: { file: 'assets/artworks/hourglass-of-light.jpg',      title: 'The Hourglass of Light',    shape: 'landscape' }
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');

function artOf(key) {
  if (!ART[key]) throw new Error('unknown artwork key ' + key);
  return ART[key];
}

function sceneHtml(s, uris) {
  const a = artOf(s.art);
  const art = `<div class="art ${a.shape}"><img src="${uris[s.art]}" alt="${esc(a.title)}"></div>`;
  const inner = s.scene === 'room'
    ? `<div class="wash"></div>${art}<div class="head"></div><div class="pillow" style="left:35%"></div><div class="pillow" style="right:35%"></div>
       <div class="bed"></div><div class="throw"></div><div class="table" style="left:13%"></div><div class="table" style="right:13%"></div>
       <div class="lamp" style="left:14.5%"></div><div class="lamp" style="right:14.5%"></div>`
    : `<div class="spot"></div><div class="sconce" style="left:6%"></div><div class="sconce" style="right:6%"></div>${art}
       <div class="vase"></div><div class="console"></div><div class="leg" style="left:32%"></div><div class="leg" style="right:32%"></div><div class="refl"></div>`;
  return `<figure class="scene-wrap"><div class="scene ${s.scene === 'room' ? 'room' : 'lobby'}">${inner}<span class="label">Illustrative visualisation</span></div>
    <figcaption class="cap"><span>${esc(s.caption)}</span><span>${esc(a.title)}</span></figcaption></figure>`;
}

function fill(template, d, uris) {
  const hero = artOf(d.heroArt);
  const conceptArt = artOf(d.concept.art);
  const v = {
    HOTEL: esc(d.hotel), SHORT: esc(d.shortName), DATE: esc(d.date),
    FONT_SERIF: uris.FONT_SERIF, FONT_SERIF_ITALIC: uris.FONT_SERIF_ITALIC, LOGO: uris.LOGO,
    CONCEPT_TITLE: esc(d.concept.title), CONCEPT_SUBTITLE: esc(d.concept.subtitle),
    COVER_TAG: esc(d.coverTag), HERO_IMG: uris[d.heroArt], HERO_TITLE: esc(hero.title),
    HEADLINE: esc(d.headline), OPP_LEAD: esc(d.opportunity),
    READING: d.reading.map((r, i) => `<div><p class="n">${pad(i + 1)}</p><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join(''),
    FACTS: d.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join(''),
    CONCEPT_IMG: uris[d.concept.art], CONCEPT_IMG_TITLE: esc(conceptArt.title),
    CONCEPT_IMG_CLASS: conceptArt.shape === 'landscape' ? 'wide' : '',
    CONCEPT_STATEMENT: esc(d.concept.statement),
    PILLARS: d.concept.pillars.map((p, i) => `<div class="pillar"><p class="n">${pad(i + 1)}</p><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join(''),
    CARDS: d.collection.map(c => `<div class="card"><div class="img"><img src="${uris[c.art]}" alt="${esc(artOf(c.art).title)}"></div>
      <h3>${esc(artOf(c.art).title)}</h3><p class="meta">${esc(c.role)}</p><p>${esc(c.text)}</p></div>`).join(''),
    BESPOKE: d.bespoke.map(b => `<div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join(''),
    SCENES: d.scenes.map(s => sceneHtml(s, uris)).join(''),
    PLACES: d.placements.map(p => `<div class="place"><p class="meta">${esc(p.space)}</p><p>${esc(p.proposal)}</p></div>`).join(''),
    TIERS: d.tiers.map((t, i) => `<div class="tier${i === 1 ? ' mid' : ''}"><p class="n">${['I', 'II', 'III'][i]}</p><h3>${esc(t.name)}</h3>
      <ul>${t.scope.map(s => `<li>${esc(s)}</li>`).join('')}</ul><p class="price"><b>${esc(t.priceHead)}</b>${esc(t.priceNote)}</p></div>`).join(''),
    NEXT_STEP: esc(d.nextStep)
  };
  let html = template;
  for (const [k, val] of Object.entries(v)) html = html.split('{{' + k + '}}').join(val);
  const left = html.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error(d.slug + ': unreplaced placeholders ' + [...new Set(left)].join(','));
  return html;
}

function emailMd(d) {
  const e = d.email;
  return `# Outreach e-mail — ${d.hotel}\n\n` +
    `**Aan / route:** ${e.to}\n\n` +
    `**Bijlage:** ${d.slug}.pdf\n\n` +
    `**Onderwerp:** ${e.subject}\n\n---\n\n${e.body.join('\n\n')}\n\n---\n\n` +
    `_Niet verzenden voordat de prijzen in het voorstel zijn bevestigd. Bronnen voor de hotelgegevens:_\n\n` +
    d.sources.map(s => `- ${s}`).join('\n') + '\n';
}

(async () => {
  const files = fs.readdirSync(HOTELS).filter(f => f.endsWith('.json'))
    .filter(f => only.length === 0 || only.includes(f.replace(/\.json$/, '')));
  if (!files.length) throw new Error('no hotel data sheets selected');
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ executablePath: fs.existsSync(CHROMIUM) ? CHROMIUM : undefined, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message));

  await page.setContent('<!doctype html><meta charset="utf-8"><body></body>');
  const uris = {
    FONT_SERIF: 'data:font/ttf;base64,' + fs.readFileSync(path.join(ROOT, 'assets/fonts/CormorantGaramond-Variable.ttf')).toString('base64'),
    FONT_SERIF_ITALIC: 'data:font/ttf;base64,' + fs.readFileSync(path.join(ROOT, 'assets/fonts/CormorantGaramond-Italic-Variable.ttf')).toString('base64'),
    LOGO: 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets/logo/gallery-dutch-art-logo-original-transparent.png')).toString('base64')
  };
  for (const [key, spec] of Object.entries(ART)) {
    const src = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ROOT, spec.file)).toString('base64');
    uris[key] = await page.evaluate(async ({ src, w }) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
      const h = Math.round(img.naturalHeight * w / img.naturalWidth);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/jpeg', 0.84);
    }, { src, w: spec.shape === 'landscape' ? 1400 : 1000 });
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(HOTELS, f), 'utf8'));
    const html = fill(template, d, uris);
    const tmp = path.join(require('os').tmpdir(), 'gda-proposal-' + d.slug + '.html');
    fs.writeFileSync(tmp, html);
    await page.emulateMedia({ media: 'print' });
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const overflow = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => {
      const r = p.getBoundingClientRect();
      const bad = [...p.querySelectorAll('h1,h2,h3,p,li,dd,figure,.cards,.tiers,.places,.next,.scenes')]
        .filter(el => { const b = el.getBoundingClientRect(); return b.bottom > r.bottom - 1 || b.right > r.right - 1; })
        .map(el => el.className || el.tagName);
      return bad.length ? `page ${i + 1}: ${bad.slice(0, 4).join(', ')}` : null;
    }).filter(Boolean));
    if (overflow.length) console.warn(d.slug, 'OVERFLOW', overflow.join(' | '));

    if (SHOTS) {
      const dir = path.join(SHOTS, d.slug);
      fs.mkdirSync(dir, { recursive: true });
      const handles = await page.$$('.page');
      for (let i = 0; i < handles.length; i++) await handles[i].screenshot({ path: path.join(dir, 'page-' + pad(i + 1) + '.png') });
    }
    const pdf = path.join(OUT, d.slug + '.pdf');
    await page.pdf({ path: pdf, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
    fs.writeFileSync(path.join(OUT, d.slug + '-email.md'), emailMd(d));
    console.log(d.slug, Math.round(fs.statSync(pdf).size / 1024) + ' KB');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
