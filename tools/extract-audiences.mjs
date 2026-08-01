#!/usr/bin/env node
// One-time extraction: slice the v1 audience research out of aiService.ts into
// per-audience markdown lens files. Founder-local tool; not used at runtime.
//
// Usage: node tools/extract-audiences.mjs [path-to-aiService.ts]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC =
  process.argv[2] ??
  '/Users/dhilbarroshan/Developer/suade-ai-anthropic-sdk/apps/frontend/src/lib/services/aiService.ts';

// v1 key → v2 lens file. Targets land in data/audiences/, destinations in _shared/.
const TARGET_FILES = {
  'target-1': 'a16z',
  'target-2': 'yc-demo-day',
  'target-3': 'sequoia',
  'target-4': 'accel',
  'target-5': 'all-hands',
  'target-6': 'eng-standup',
  'target-7': 'board-monthly',
  'target-8': 'board-quarterly',
  custom: 'generic'
};
const DESTINATION_FILES = { investors: 'investors', team: 'team', board: 'board', custom: 'custom-destination' };
const DESTINATION_OF = {
  a16z: 'investors', 'yc-demo-day': 'investors', sequoia: 'investors', accel: 'investors',
  'all-hands': 'team', 'eng-standup': 'team',
  'board-monthly': 'board', 'board-quarterly': 'board',
  generic: 'custom-destination'
};

const lines = readFileSync(SRC, 'utf8').split('\n');

// Scan for section markers and key lines instead of trusting absolute line
// numbers; the same 'custom' key exists in both prompt objects.
let section = null; // 'targets' | 'destinations' | null
const blocks = []; // {section, key, startIdx}
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/const TARGET_SPECIFIC_PROMPTS/.test(line)) section = 'targets';
  else if (/const DESTINATION_FIXED_PROMPTS/.test(line)) section = 'destinations';
  else if (/const UNIVERSAL_OUTPUT_SCHEMA/.test(line)) section = null;
  if (!section) continue;
  const m = line.match(/^\s*'([a-z0-9-]+)':\s*`/);
  if (m) blocks.push({ section, key: m[1], startIdx: i });
}

if (blocks.length === 0) {
  console.error('No prompt blocks found — did aiService.ts move or change shape?');
  process.exit(1);
}

const written = [];
for (let b = 0; b < blocks.length; b++) {
  const { section: sec, key, startIdx } = blocks[b];
  const endIdx = b + 1 < blocks.length && blocks[b + 1].section === sec
    ? blocks[b + 1].startIdx
    : findObjectEnd(startIdx);
  const raw = lines.slice(startIdx, endIdx).join('\n');
  const first = raw.indexOf('`');
  const last = raw.lastIndexOf('`');
  if (first === -1 || last <= first) {
    console.error(`Skipping ${sec}/${key}: could not find template-literal bounds`);
    continue;
  }
  let content = raw
    .slice(first + 1, last)
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
    .trim();

  const name = sec === 'targets' ? TARGET_FILES[key] : DESTINATION_FILES[key];
  if (!name) {
    console.error(`Skipping unknown key ${sec}/${key}`);
    continue;
  }
  const rel = sec === 'targets'
    ? join('data', 'audiences', `${name}.md`)
    : join('data', 'audiences', '_shared', `${name}.md`);

  const header = [
    '<!--',
    `  Suade audience lens: ${name}`,
    `  Extracted from v1 aiService.ts key '${key}' (lines ${startIdx + 1}-${endIdx}) on 2026-08-02.`,
    sec === 'targets' ? `  Destination layer: _shared/${DESTINATION_OF[name]}.md` : '  Destination-layer lens (shared across its targets).',
    '  Status: RAW EXTRACTION unless an "Edited for critique" marker appears below.',
    '-->',
    ''
  ].join('\n');

  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), header + content + '\n');
  written.push({ rel, lines: content.split('\n').length, chars: content.length });
}

function findObjectEnd(fromIdx) {
  for (let i = fromIdx + 1; i < lines.length; i++) {
    if (/^\};?\s*$/.test(lines[i])) return i;
  }
  return lines.length;
}

const index = [
  '# Audience lens index',
  '',
  'A critique or blueprint run loads exactly ONE target lens plus its destination-layer file.',
  '',
  '| Lens id | File | Destination layer |',
  '|---|---|---|',
  ...Object.values(TARGET_FILES).map((n) => `| ${n} | ${n}.md | _shared/${DESTINATION_OF[n]}.md |`),
  ''
].join('\n');
writeFileSync(join(ROOT, 'data', 'audiences', '_shared', 'index.md'), index);

console.log('Wrote', written.length, 'lens files + _shared/index.md');
for (const w of written) console.log(`  ${w.rel}  (${w.lines} lines, ${w.chars} chars)`);
