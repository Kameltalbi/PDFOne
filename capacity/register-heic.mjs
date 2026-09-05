// After local conversion of fixtures/image.png using the documented sips command.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('./fixtures/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', root), 'utf8'));
const source = await fs.readFile(new URL('image.png', root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
if (sha(source) !== manifest.files.find(f => f.name === 'image.png')?.sha256) throw new Error('Synthetic source hash mismatch');
const bytes = await fs.readFile(new URL('image.heic', root));
if (!bytes.subarray(0, 40).includes(Buffer.from('ftyp'))) throw new Error('Invalid HEIC container');
manifest.files = manifest.files.filter(f => f.name !== 'image.heic');
manifest.files.push({ name: 'image.heic', bytes: bytes.length, sha256: sha(bytes), family: 'synthetic-scan', sourceSha256: sha(source), encoder: 'macOS sips' });
await fs.writeFile(new URL('manifest.json', root), JSON.stringify(manifest, null, 2) + '\n');
console.log('Registered locally generated synthetic HEIC fixture.');
