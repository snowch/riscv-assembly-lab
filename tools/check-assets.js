import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile(new URL('../asset-manifest.json', import.meta.url)));
for (const [path, expected] of Object.entries(manifest.sha256)) {
  const data = await readFile(new URL('../' + path, import.meta.url));
  if (createHash('sha256').update(data).digest('hex') !== expected) throw new Error('Asset checksum mismatch: ' + path);
}
console.log(`Verified ${Object.keys(manifest.sha256).length} pinned assets.`);
