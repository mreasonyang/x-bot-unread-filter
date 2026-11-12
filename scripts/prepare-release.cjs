'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const scriptName = 'x-human-dm-badge.user.js';
const source = fs.readFileSync(path.join(root, scriptName), 'utf8');
const header = source.match(/^\/\/ ==UserScript==\r?\n[\s\S]*?^\/\/ ==\/UserScript==/m)?.[0];
if (!header) throw Error('Missing userscript header');
const version = header.match(/^\/\/\s+@version\s+(\S+)/m)?.[1];
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (version !== pkg.version) throw Error('Userscript and package versions must match');
if (!/^\/\/\s+@license\s+MIT$/m.test(header)) throw Error('MIT metadata is required');
fs.writeFileSync(path.join(root, 'x-human-dm-badge.meta.js'), `${header}\n`);
const output = path.join(root, 'release', version);
fs.mkdirSync(path.join(output, 'docs'), { recursive: true });
const files = [scriptName, 'x-human-dm-badge.meta.js', 'README.md', 'LICENSE', 'CHANGELOG.md', 'docs/badge-preview.svg'];
const manifest = { name: pkg.name, version, license: pkg.license, files: [] };
for (const name of files) {
  const content = fs.readFileSync(path.join(root, name));
  fs.writeFileSync(path.join(output, name), content);
  manifest.files.push({ path: name, bytes: content.length, sha256: crypto.createHash('sha256').update(content).digest('hex') });
}
fs.writeFileSync(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${pkg.name} ${version}: ${files.length} public files; no upload performed.`);
