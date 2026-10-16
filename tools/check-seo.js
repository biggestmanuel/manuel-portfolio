const fs = require('fs');

const pad = (s, n) => String(s === null || s === undefined || s === '' ? '--' : s).padEnd(n);
const g = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

const files = fs.readdirSync('.').filter((f) => f.endsWith('.html')).sort();

console.log(
  '  ' + pad('file', 46) + pad('tw:site', 14) + pad('og:image', 34) +
  pad('og dims', 11) + pad('gsc', 5) + pad('jsonld', 8) + pad('noDims', 8) + 'noindex'
);

let problems = 0;
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const isStub = /name="robots" content="noindex/.test(h);

  const imgs = [...h.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noDims = imgs.filter(
    (t) => !/width="/.test(t) && !/height="/.test(t) && !/lightboxImg/.test(t)
  ).length;

  const row = {
    file: f,
    tw: g(h, /name="twitter:site" content="([^"]+)/),
    og: (g(h, /property="og:image" content="([^"]+)/) || '').replace('https://biggestmanuel.vercel.app/', ''),
    dims: (g(h, /property="og:image:width" content="(\d+)/) || '?') + 'x' + (g(h, /property="og:image:height" content="(\d+)/) || '?'),
    gsc: /google-site-verification/.test(h),
    ld: /application\/ld\+json/.test(h),
    noDims,
    noindex: isStub,
  };

  console.log(
    '  ' + pad(row.file, 46) + pad(row.tw, 14) + pad(row.og, 34) +
    pad(row.dims, 11) + pad(row.gsc, 5) + pad(row.ld, 8) + pad(row.noDims, 8) + row.noindex
  );

  if (!isStub) {
    if (!row.tw) { console.log('       -> missing twitter:site'); problems++; }
    if (row.noDims > 0) { console.log('       -> ' + row.noDims + ' image(s) without width/height'); problems++; }
    if (!row.ld) { console.log('       -> no JSON-LD'); problems++; }
  }
}
console.log('\n  ' + (problems ? problems + ' issue(s)' : 'every indexable page complete'));