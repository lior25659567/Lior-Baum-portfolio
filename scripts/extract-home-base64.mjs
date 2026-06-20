// One-time: extract inline base64 data: URLs from home-content.json into real
// files under public/home/ and replace each occurrence with its file path.
// Lossless — the bytes written are exactly the decoded base64 (no re-encoding).
// Operates on the raw text so the rest of the JSON stays byte-for-byte intact.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const JSON_PATH = 'src/data/home-content.json';
const OUT_DIR = 'public/home';
const PUBLIC_PREFIX = '/home';

const EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg',
  'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};

const raw = readFileSync(JSON_PATH, 'utf8');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Match a full data URI as it appears inside a JSON string value.
const re = /data:(image|video)\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]+=*/g;

const seen = new Map(); // dataUri -> publicPath (dedupe identical images)
let count = 0, bytes = 0;

const out = raw.replace(re, (uri) => {
  if (seen.has(uri)) return seen.get(uri);
  const mime = uri.slice(5, uri.indexOf(';')).toLowerCase();
  const ext = EXT[mime] || 'bin';
  const b64 = uri.slice(uri.indexOf(',') + 1);
  const buf = Buffer.from(b64, 'base64');
  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 12);
  const filename = `img-${hash}.${ext}`;
  const filePath = path.join(OUT_DIR, filename);
  if (!existsSync(filePath)) writeFileSync(filePath, buf);
  const publicPath = `${PUBLIC_PREFIX}/${filename}`;
  seen.set(uri, publicPath);
  count++; bytes += buf.length;
  console.log(`  ${mime}  ${(buf.length / 1024).toFixed(0)} KB  -> ${publicPath}`);
  return publicPath;
});

// Validate the result is still valid JSON before writing.
JSON.parse(out);
writeFileSync(JSON_PATH, out);

console.log(`\nExtracted ${count} inline media (${seen.size} unique), ${(bytes / 1048576).toFixed(1)} MB total.`);
console.log(`home-content.json: ${(raw.length / 1048576).toFixed(1)} MB -> ${(out.length / 1024).toFixed(0)} KB`);
