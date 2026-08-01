#!/usr/bin/env node
// Zero-dependency .pptx text extractor: per-slide text + speaker notes as
// markdown on stdout. A .pptx is a zip of XML; this reads the zip central
// directory directly (node:zlib only — no npm installs, works offline).
//
// Extracts TEXT AND NOTES ONLY. No layout, no images. That is a stated
// limitation of the narrative-critique path, not an accident.
//
// Usage: node scripts/extract-pptx.mjs <deck.pptx>

import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';

const path = process.argv[2];
if (!path) {
  console.error('Usage: node scripts/extract-pptx.mjs <deck.pptx>');
  process.exit(1);
}
const buf = readFileSync(path);

// End-of-central-directory record: scan back for PK\x05\x06.
let eocd = -1;
for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
}
if (eocd === -1) {
  console.error(`Not a zip/pptx file: ${path}`);
  process.exit(1);
}
const cdCount = buf.readUInt16LE(eocd + 10);
let off = buf.readUInt32LE(eocd + 16);

const entries = new Map();
for (let n = 0; n < cdCount; n++) {
  if (buf.readUInt32LE(off) !== 0x02014b50) break;
  const method = buf.readUInt16LE(off + 10);
  const csize = buf.readUInt32LE(off + 20);
  const nlen = buf.readUInt16LE(off + 28);
  const xlen = buf.readUInt16LE(off + 30);
  const clen = buf.readUInt16LE(off + 32);
  const lho = buf.readUInt32LE(off + 42);
  const name = buf.toString('utf8', off + 46, off + 46 + nlen);
  entries.set(name, { method, csize, lho });
  off += 46 + nlen + xlen + clen;
}

function readEntry(name) {
  const e = entries.get(name);
  if (!e) return null;
  const nlen = buf.readUInt16LE(e.lho + 26);
  const xlen = buf.readUInt16LE(e.lho + 28);
  const start = e.lho + 30 + nlen + xlen;
  const data = buf.subarray(start, start + e.csize);
  return e.method === 8 ? inflateRawSync(data).toString('utf8') : data.toString('utf8');
}

const unescape = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

// One line per <a:p> paragraph; text runs are <a:t>…</a:t>.
function paragraphs(xml) {
  const out = [];
  for (const p of xml.split(/<\/a:p>/)) {
    const runs = [...p.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => unescape(m[1]));
    const line = runs.join('').trim();
    if (line) out.push(line);
  }
  return out;
}

const slideNums = [...entries.keys()]
  .map((n) => n.match(/^ppt\/slides\/slide(\d+)\.xml$/)?.[1])
  .filter(Boolean)
  .map(Number)
  .sort((a, b) => a - b);

if (slideNums.length === 0) {
  console.error('No slides found (ppt/slides/slideN.xml missing) — is this a .pptx?');
  process.exit(1);
}

console.log(`<!-- extracted from ${path} · ${slideNums.length} slides · text+notes only, no layout -->`);
for (const n of slideNums) {
  console.log(`\n## Slide ${n}\n`);
  const lines = paragraphs(readEntry(`ppt/slides/slide${n}.xml`) ?? '');
  if (lines.length === 0) console.log('*(no extractable text — slide may be image-only)*');
  for (const l of lines) console.log(`- ${l}`);
  const notesXml = readEntry(`ppt/notesSlides/notesSlide${n}.xml`);
  if (notesXml) {
    const notes = paragraphs(notesXml).filter((l) => !/^\d+$/.test(l));
    if (notes.length) {
      console.log('\n### Speaker notes\n');
      for (const l of notes) console.log(`> ${l}`);
    }
  }
}
