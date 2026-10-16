/**
 * Pre-renders the four case studies into standalone static HTML pages.
 *
 * Why this exists: the case studies used to be rendered entirely by JavaScript
 * from a `?project=` query string, which left crawlers (and anyone with JS
 * disabled) with an empty page and no heading to index. Each project now ships
 * as real HTML with its own title, description, canonical URL and JSON-LD.
 *
 * The data still lives in case-study.js so there is one place to edit. After
 * changing anything in CASE_STUDIES, re-run:
 *
 *     node tools/generate-case-studies.js
 *
 * and commit the regenerated files. No build step, no dependencies: the output
 * is plain static HTML that Vercel serves as-is.
 *
 * Intrinsic image sizes come from tools/image-dimensions.json, written by
 * tools/scan-image-dimensions.js. Emitting width and height keeps the browser
 * from reflowing the page as images arrive, which is what the Layout
 * Shift score measures.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'case-study.js');
const ORIGIN = 'https://biggestmanuel.vercel.app';
const HANDLE = 'biggestmanuel';

/* ------------------------------------------------------------------ data */

// Pull the CASE_STUDIES object literal straight out of case-study.js and
// evaluate it, so the generator always agrees with what the runtime uses.
function readCaseStudies() {
  const src = fs.readFileSync(SOURCE, 'utf8');
  const start = src.indexOf('const CASE_STUDIES =');
  if (start === -1) throw new Error('CASE_STUDIES not found in case-study.js');

  const braceStart = src.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end === -1) throw new Error('CASE_STUDIES braces are unbalanced');

  // eslint-disable-next-line no-eval
  return eval('(' + src.slice(braceStart, end) + ')');
}

const escapeHtml = (v) =>
  String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slugFor = (id) => 'case-study-' + id + '.html';
const metaFor = (id) => ORIGIN + '/' + slugFor(id);

/** Trim a sentence to roughly `limit` chars without cutting a word in half. */
function summarise(text, limit) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 40 ? lastSpace : limit).replace(/[,;:.]$/, '') + '.';
}

/* ------------------------------------------------- intrinsic image sizes */

// key is the repo-relative path exactly as it appears in the markup
let SIZE_MAP = {};
try {
  const scanned = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-dimensions.json'), 'utf8'));
  for (const row of scanned) SIZE_MAP[row.file] = row;
} catch (e) {
  console.warn('warning: image-dimensions.json not found, width/height will be omitted.');
}

/** Emits width/height attributes when the intrinsic size is known. */
function sizeAttrs(src) {
  const row = SIZE_MAP[src];
  if (!row) return '';
  return ` width="${row.w}" height="${row.h}"`;
}

/* ---------------------------------------------------------------- render */

function renderBody(project) {
  const p = project;
  let html = `
    <section class="case-hero">
      <p class="case-eyebrow shiny-accent">Case study</p>
      <div class="case-badges-row">
        <span class="case-pill">${escapeHtml(p.tag)}</span>
        <span class="case-pill status">${escapeHtml(p.status)}</span>
      </div>
      <h1 class="case-title">${escapeHtml(p.title)}</h1>
      ${
        p.liveUrl
          ? `<a class="case-hero-cta" href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer">
              <span>Visit Live Platform</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>`
          : ''
      }
    </section>

    <div class="case-featured-img-wrap">
      <img class="case-featured-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} preview"${sizeAttrs(p.image)} loading="eager" decoding="async" />
    </div>`;

  if (p.type === 'own') {
    html += `
    <article class="case-card">
      <h2>The Challenge &amp; Context</h2>
      <p>${escapeHtml(p.problem)}</p>
    </article>

    <article class="case-card">
      <h2>Architecture &amp; Engineering Approach</h2>
      <p>${escapeHtml(p.approach)}</p>
    </article>`;
  } else {
    html += `
    <article class="case-card">
      <h2>Why It Was Built &amp; Project Scope</h2>
      <p>${escapeHtml(p.whyItWasBuilt)}</p>
    </article>`;
  }

  if (p.stack && p.stack.length) {
    html += `
    <article class="case-card">
      <h2>Core Technologies</h2>
      <div class="case-stack-list">
        ${p.stack.map((s) => `<span class="case-stack-item">${escapeHtml(s)}</span>`).join('')}
      </div>
    </article>`;
  }

  if (p.gallery && p.gallery.length) {
    html += `
    <article class="case-card">
      <h2>Interface &amp; Experience Gallery</h2>
      <div class="case-gallery-grid">
        ${p.gallery
          .map(
            (item) => `
        <div class="case-gallery-card${item.mode === 'mobile' ? ' mobile-shot' : ''}" data-src="${escapeHtml(item.src)}" data-caption="${escapeHtml(item.label)}">
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.label)}"${sizeAttrs(item.src)} loading="lazy" decoding="async" />
          <div class="case-gallery-caption">${escapeHtml(item.label)}</div>
        </div>`
          )
          .join('')}
      </div>
    </article>`;
  }

  return html;
}

function renderPagination(id, keys, studies) {
  const i = keys.indexOf(id);
  const prev = i > 0 ? keys[i - 1] : null;
  const next = i < keys.length - 1 ? keys[i + 1] : null;

  return `
    <nav class="case-pagination" aria-label="Other case studies">
      ${
        prev
          ? `<a href="${slugFor(prev)}" class="case-page-btn" rel="prev">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>${escapeHtml(studies[prev].title)}</span>
            </a>`
          : '<div></div>'
      }
      ${
        next
          ? `<a href="${slugFor(next)}" class="case-page-btn" rel="next">
              <span>${escapeHtml(studies[next].title)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>`
          : '<div></div>'
      }
    </nav>`;
}

function page(project, keys, studies) {
  const p = project;
  const url = metaFor(p.id);
  const title = `${p.title}, Case Study | Biggest Manuel`;
  const description = summarise(p.problem || p.whyItWasBuilt || '', 155);

  // og:image points at the generated 1200x630 card, which platforms crop to
  // exactly. The screenshots are 1.78 to 2.15, so linking those directly made
  // X and Facebook slice content off the edges.
  const cardPath = 'img/og/og-' + p.id + '.png';
  const shareImage = ORIGIN + '/' + cardPath;
  const share = { w: 1200, h: 630 };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': url + '#work',
    name: `${p.title} case study`,
    headline: p.title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en',
    image: ORIGIN + '/' + p.image,
    author: { '@id': ORIGIN + '/#person' },
    publisher: { '@id': ORIGIN + '/#person' },
    creator: { '@id': ORIGIN + '/#person' },
    keywords: (p.stack || []).join(', '),
    isAccessibleForFree: true,
    datePublished: '2026-10-16',
    dateModified: new Date().toISOString().slice(0, 10),
    isPartOf: { '@id': ORIGIN + '/#website' },
  };
  if (p.liveUrl) {
    jsonLd.subjectOf = { '@type': 'WebSite', name: p.title + ' live site', url: p.liveUrl };
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="Nwuba Emmanuel (Biggest Manuel)" />
  <meta name="google-site-verification" content="U_vKMJwcogtemZi42I3_8hMwKubSanzyIhRfkG8V-g4" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <!-- Browser chrome follows the theme. Without the media pair the mobile
       address bar stays light while the page itself goes dark. -->
  <meta name="theme-color" content="#f5f7fa" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#16191f" media="(prefers-color-scheme: dark)" />

  <link rel="canonical" href="${url}" />
  <title>${escapeHtml(title)}</title>

  <link rel="icon" type="image/x-icon" href="favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="favicon-180.png" />
  <link rel="manifest" href="site.webmanifest" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Biggest Manuel" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${shareImage}" />
  <meta property="og:image:width" content="${share.w}" />
  <meta property="og:image:height" content="${share.h}" />
  <meta property="og:image:alt" content="${escapeHtml(p.title)} case study card" />
  <meta property="og:url" content="${url}" />
  <meta property="article:author" content="Nwuba Emmanuel" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@${HANDLE}" />
  <meta name="twitter:creator" content="@${HANDLE}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${shareImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(p.title)} case study card" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="case-study.css" />

  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2).split('\n').map((l) => '  ' + l).join('\n')}
  </script>

  <script>
    /* Resolve the theme before first paint so a dark visitor never sees a
       white flash. Matches the homepage: an explicit choice in localStorage
       wins, otherwise follow the operating system. */
    (function () {
      var theme = 'light';
      try {
        var stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
          theme = stored;
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          theme = 'dark';
        }
      } catch (e) { /* private mode: fall through to light */ }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
</head>

<body class="case-study-page">
  <header class="case-topbar">
    <div class="shell">
      <a class="case-brand" href="index.html">
        <span class="case-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </span>
        <span>Biggest Manuel<span class="brand-dot">.</span></span>
      </a>

      <div class="case-topbar-actions">
        <a href="index.html#projects" class="case-nav-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to projects</span>
        </a>
      </div>
    </div>
  </header>

  <main class="case-main shell">
${renderBody(p)}
${renderPagination(p.id, keys, studies)}
  </main>

  <div id="imageLightbox" class="lightbox-modal" hidden>
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <button id="closeLightboxBtn" class="lightbox-close-btn" type="button" aria-label="Close image preview">&times;</button>
      <img id="lightboxImg" alt="Full preview" />
      <p id="lightboxCaption" class="lightbox-caption"></p>
    </div>
  </div>

  <footer class="case-footer">
    <div class="shell">
      <div class="footer-bottom">
        <p>Copyright &copy; 2026 Nwuba Emmanuel Chukwuebuka. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="case-study.js"></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ main */

const studies = readCaseStudies();
const keys = Object.keys(studies);

for (const id of keys) {
  fs.writeFileSync(path.join(ROOT, slugFor(id)), page(studies[id], keys, studies), 'utf8');
  console.log('wrote ' + slugFor(id) + '  (' + studies[id].title + ')');
}
console.log('\n' + keys.length + ' static case study pages generated.');
console.log('Also update index.html links and sitemap.xml if any project was added.');