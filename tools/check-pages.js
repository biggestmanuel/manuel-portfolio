const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(
  (f) => f.endsWith('.html')
);

let problems = 0;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const issues = [];

  // JSON-LD
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      issues.push('JSON-LD parse error: ' + e.message);
    }
  }

  // headings
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 === 0) issues.push('no <h1>');
  if (h1 > 1) issues.push(h1 + ' <h1> elements (multiple)');

  // em dash anywhere in rendered markup
  if (html.includes('\u2014')) issues.push('contains an em dash');
  if (html.includes('\u2013')) issues.push('contains an en dash');

  // A noindex redirect stub is never surfaced in results, so canonical and
  // Open Graph tags on it would be dead weight rather than a defect.
  const isRedirectStub = /name="robots" content="noindex/.test(html);

  // required meta
  for (const [label, re] of [
    ['title', /<title>[^<]+<\/title>/],
    ['description', /name="description" content="[^"]+"/],
    ['canonical', /rel="canonical" href="https:\/\/biggestmanuel\.vercel\.app\/[^"]*"/],
    ['og:title', /property="og:title"/],
    ['og:image', /property="og:image"/],
    ['viewport', /name="viewport"/],
  ]) {
    if (isRedirectStub && ['canonical', 'og:title', 'og:image'].includes(label)) continue;
    if (!re.test(html)) issues.push('missing ' + label);
  }

  // lang
  if (!/<html lang="[a-z]{2}/.test(html)) issues.push('missing lang on <html>');

  // theme-color pair (the site now ships two themes)
  if (!/name="theme-color"[^>]*media="\(prefers-color-scheme: light\)"/.test(html)) {
    issues.push('missing light theme-color');
  }
  if (!/name="theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/.test(html)) {
    issues.push('missing dark theme-color');
  }

  // images without alt
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=/.test(t));
  if (noAlt.length) issues.push(noAlt.length + ' img without alt');

  const status = issues.length ? 'FAIL' : 'ok  ';
  if (issues.length) problems++;
  console.log(status + '  ' + f.padEnd(44) + (issues.length ? issues.join(' | ') : 'clean'));
}

console.log('\n' + (problems ? problems + ' file(s) with issues' : 'all ' + files.length + ' pages clean'));