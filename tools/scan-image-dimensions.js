const fs = require('fs');
const path = require('path');

function dims(file) {
  try {
    const b = fs.readFileSync(file);
    const tag = b.slice(12, 16).toString();
    if (tag === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3), 'webp'];
    if (tag === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff, 'webp'];
    if (tag === 'VP8L') { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1, 'webp']; }
    if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20), 'png'];
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5), 'jpg'];
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch (e) { return null; }
}

const out = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'fileicons') walk(p); }
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) {
      const d = dims(p);
      if (d) out.push({ file: p.replace(/\\/g, '/'), w: d[0], h: d[1], type: d[2], ratio: +(d[0] / d[1]).toFixed(3) });
    }
  }
}
walk('img');
for (const f of ['me.webp', 'og-cover.png']) { const d = dims(f); if (d) out.push({ file: f, w: d[0], h: d[1], type: d[2], ratio: +(d[0] / d[1]).toFixed(3) }); }

for (const o of out) {
  const shareable = Math.abs(o.ratio - 1.905) < 0.15 ? 'og-safe' : 'not 1.91:1';
  console.log(`  ${o.file.padEnd(44)} ${String(o.w).padStart(5)}x${String(o.h).padEnd(5)} ${o.type.padEnd(5)} ratio ${String(o.ratio).padStart(6)}  ${shareable}`);
}
console.log('\n' + out.length + ' images');
fs.writeFileSync('tools/image-dimensions.json', JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('wrote tools/image-dimensions.json');