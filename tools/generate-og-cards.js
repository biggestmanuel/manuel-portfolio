/**
 * Renders one 1200x630 social card per case study, matching the style of
 * og-cover.png: soft-blue grid, blue accent bar, Space Grotesk heading,
 * Manrope subhead, JetBrains Mono for the stack line and URL.
 *
 * Why: the project screenshots are 1.78 to 2.15 aspect. Platforms crop social
 * cards to 1.91:1, so pointing og:image straight at them sliced content off
 * the edges. These are the correct ratio, so nothing gets cropped.
 *
 * Run after editing the tag or status fields in case-study.js:
 *     npm run cards
 *
 * Output is committed as plain PNG, so the site itself stays build-free.
 *
 * Fonts: resvg silently ignores woff2, which is all @fontsource ships, so the
 * woff2 files are decompressed to TrueType into tools/.font-cache/ first. The
 * cache is gitignored and rebuilt on demand.
 */

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const woff2 = require('wawoff2');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'img', 'og');
const CACHE = path.join(__dirname, '.font-cache');

const W = 1200;
const H = 630;

/* --------------------------------------------------- fonts, loaded by file */

// package the file comes from, inferred from the file name
const SOURCES = [
  ['space-grotesk-latin-700-normal.woff2', 'space-grotesk'],
  ['space-grotesk-latin-500-normal.woff2', 'space-grotesk'],
  ['manrope-latin-600-normal.woff2', 'manrope'],
  ['manrope-latin-500-normal.woff2', 'manrope'],
  ['jetbrains-mono-latin-500-normal.woff2', 'jetbrains-mono'],
];

async function buildFontFiles() {
  fs.mkdirSync(CACHE, { recursive: true });
  const out = [];

  for (const [file, pkg] of SOURCES) {
    const src = path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', file);
    if (!fs.existsSync(src)) {
      console.warn('warning: missing ' + src + ' (run npm install)');
      continue;
    }
    const ttfPath = path.join(CACHE, file.replace(/\.woff2$/, '.ttf'));
    // reuse the cache unless the source file is newer
    if (!fs.existsSync(ttfPath) || fs.statSync(ttfPath).mtimeMs < fs.statSync(src).mtimeMs) {
      fs.writeFileSync(ttfPath, Buffer.from(await woff2.decompress(fs.readFileSync(src))));
    }
    out.push(ttfPath);
  }
  return out;
}

/* --------------------------------------------------------------- palette */
// Same tokens as the site, so a card reads as part of the same design.
const INK = '#202938';
const INK_SOFT = '#44474b';
const INK_MUTED = '#5f6773';
const BLUE = '#0078d4';
const LINE = '#d9e0e8';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Wraps a stack list to fit the card width without overflowing. */
function fitMono(items, max) {
  const out = [];
  let line = '';
  for (const item of items) {
    const next = line ? line + '  ·  ' + item : item;
    if (next.length > max && line) {
      out.push(line);
      line = item;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out.slice(0, 2);
}

/**
 * Shrinks the heading until it fits the card, then truncates as a backstop.
 * "The Cosmetics Company Store" overflowed the right edge at the base size.
 * Space Grotesk Bold averages about 0.58em per character for mixed case.
 */
function fitTitle(title, maxW, base, min) {
  const perChar = 0.58;
  const widthAt = (s) => s * perChar;
  let size = base;
  while (size > min && widthAt(size) * title.length > maxW) size -= 2;

  const maxChars = Math.max(8, Math.floor(maxW / widthAt(size)));
  const text = title.length > maxChars ? title.slice(0, maxChars - 1).trimEnd() + '…' : title;

  return { size, text };
}

function cardSvg(project) {
  const stack = fitMono(project.stack, 46);
  const gridStep = 48;
  const margin = 84;
  const contentW = W - margin * 2;
  const title = fitTitle(project.title, contentW, 88, 42);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#f5f7fa"/>
      <stop offset="100%" stop-color="#e7f0fb"/>
    </linearGradient>
    <pattern id="grid" width="${gridStep}" height="${gridStep}" patternUnits="userSpaceOnUse">
      <path d="M ${gridStep} 0 L 0 0 0 ${gridStep}" fill="none" stroke="${LINE}" stroke-width="1" opacity="0.55"/>
    </pattern>
    <clipPath id="clip"><rect width="${W}" height="${H}"/></clipPath>
  </defs>

  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>

    <!-- blue accent bar, same placement as the homepage cover -->
    <rect x="${margin}" y="104" width="72" height="8" rx="4" fill="${BLUE}"/>

    <text x="${margin}" y="272" font-family="Space Grotesk" font-weight="700" font-size="${title.size}" fill="${INK}" letter-spacing="-2">${esc(title.text)}</text>

    <text x="${margin}" y="342" font-family="Manrope" font-weight="600" font-size="34" fill="${BLUE}">${esc(project.tag)}</text>

    <text x="${margin}" y="404" font-family="Manrope" font-weight="500" font-size="27" fill="${INK_SOFT}">${esc(project.status)}</text>

    ${stack
      .map(
        (line, i) =>
          `<text x="${margin}" y="${468 + i * 40}" font-family="JetBrains Mono" font-weight="500" font-size="24" fill="${INK_MUTED}">${esc(line)}</text>`
      )
      .join('\n    ')}

    <line x1="${margin}" y1="546" x2="${W - margin}" y2="546" stroke="${LINE}" stroke-width="1.5"/>

    <text x="${margin}" y="592" font-family="JetBrains Mono" font-weight="500" font-size="24" fill="${INK_MUTED}">biggestmanuel.vercel.app</text>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ main */

// Read the same CASE_STUDIES the site uses, so the cards cannot drift.
function readCaseStudies() {
  const src = fs.readFileSync(path.join(ROOT, 'case-study.js'), 'utf8');
  const start = src.indexOf('const CASE_STUDIES =');
  const braceStart = src.indexOf('{', start);
  let depth = 0, end = -1;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  // eslint-disable-next-line no-eval
  return eval('(' + src.slice(braceStart, end) + ')');
}

(async () => {
const studies = readCaseStudies();
fs.mkdirSync(OUT, { recursive: true });

const fontFiles = await buildFontFiles();
console.log('using ' + fontFiles.length + ' TrueType faces');

for (const id of Object.keys(studies)) {
  const p = studies[id];
  const svg = cardSvg(p);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Manrope' },
  });
  const png = resvg.render().asPng();
  const file = path.join(OUT, 'og-' + id + '.png');
  fs.writeFileSync(file, png);
  console.log('wrote img/og/og-' + id + '.png  (' + p.title + ', ' + Math.round(png.length / 1024) + ' KB)');
}

console.log('\n' + Object.keys(studies).length + ' social cards rendered at ' + W + 'x' + H + '.');
console.log('Point the case study generator at these with ogImage: "img/og/og-<id>.png".');
})();