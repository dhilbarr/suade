#!/usr/bin/env node
// One-time + regenerable: normalize the v1 archetype JSONs into the shipped
// pattern corpus (data/patterns/). Strips image URLs (kept founder-local in
// tools/corpus-private/image-map.json, gitignored). Founder-local tool.
//
// Usage: node tools/build-corpus.mjs [path-to-v1-repo]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V1 = process.argv[2] ?? '/Users/dhilbarroshan/Developer/suade-ai-anthropic-sdk';
const OUT = join(ROOT, 'data', 'patterns');
const PRIVATE = join(ROOT, 'tools', 'corpus-private');

const sources = [];
for (const f of readdirSync(V1)) if (f.endsWith('_archetypes.json')) sources.push(join(V1, f));
for (const dir of ['archetypes-embeded', 'archetype-embeds']) {
  const p = join(V1, dir);
  if (existsSync(p)) for (const f of readdirSync(p)) if (f.endsWith('.json')) sources.push(join(p, f));
}

const deckIdFromFile = (file) =>
  basename(file)
    .replace(/_archetypes\.json$/, '')
    .replace(/^archetype-embed-/, '')
    .replace(/\.json$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const imageMap = {};
const index = [];
const summary = [];
mkdirSync(join(OUT, 'decks'), { recursive: true });
mkdirSync(PRIVATE, { recursive: true });

for (const file of sources) {
  const deckId = deckIdFromFile(file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    // Known-malformed file(s): try the cheap repairs, then give up loudly.
    let raw = readFileSync(file, 'utf8').replace(/,\s*([}\]])/g, '$1');
    // uber-2021 shape: a spurious outer `{` wrapping the real object.
    if (/^\s*\{\s*\n\s*\{/.test(raw)) {
      const inner = raw.slice(raw.indexOf('{', raw.indexOf('{') + 1));
      raw = inner.slice(0, inner.lastIndexOf('}'));
    }
    try {
      parsed = JSON.parse(raw);
      summary.push({ deckId, note: 'repaired' });
    } catch (e2) {
      summary.push({ deckId, note: `DROPPED — unparseable: ${e2.message.slice(0, 80)}` });
      continue;
    }
  }

  const slides = Array.isArray(parsed) ? parsed : (parsed.slides ?? parsed.archetypes);
  if (!Array.isArray(slides)) {
    summary.push({ deckId, note: `DROPPED — no slides[] (keys: ${Object.keys(parsed).join(',')})` });
    continue;
  }
  const meta = parsed.presentation_metadata ?? {};

  const usedIds = new Set();
  const records = slides.map((s, i) => {
    const rawN = s.slide_metadata?.slide_number;
    let n = Number.isInteger(rawN) && rawN > 0 ? rawN : i + 1;
    const mkId = (num) => `${deckId}#s${String(num).padStart(3, '0')}`;
    let id = mkId(n);
    // Source decks occasionally number two slides identically; ids must not.
    if (usedIds.has(id)) id = mkId(i + 1);
    while (usedIds.has(id)) id = mkId(++n + slides.length);
    usedIds.add(id);
    for (const k of ['image_url', 'cloudinary_url']) if (s[k]) imageMap[id] = s[k];

    const rich = s.semantic_pattern != null;
    const rec = rich
      ? {
          id,
          schema: 'rich',
          core_message: s.slide_core_message ?? null,
          intents: [s.communication_intent?.primary, ...(s.communication_intent?.supporting ?? [])].filter(Boolean),
          shows: s.what_it_shows_literally ?? null,
          abstract_pattern: s.semantic_pattern?.abstract_pattern ?? null,
          keywords: s.semantic_pattern?.pattern_keywords ?? [],
          works_for: s.semantic_pattern?.works_for_these_messages ?? [],
          variable_elements: s.semantic_pattern?.variable_elements ?? [],
          data_requirements: s.data_requirements ?? null,
          use_when: s.use_when ?? null,
          visual_complexity: s.visual_complexity ?? null,
          section: s.slide_metadata?.inferred_section ?? null,
          position: s.slide_metadata?.estimated_presentation_position ?? null,
          title: s.slide_metadata?.slide_title ?? s.name ?? null
        }
      : {
          // Light schema (nubank, snap-2024, uber-2021): map onto the same shape.
          id,
          schema: 'light',
          core_message: s.communication_goal ?? s.slide_core_message ?? null,
          intents: s.emotional_tones ?? [],
          shows: (s.description || s.visual_strategy_description)
            ? { specific_content: s.description ?? s.visual_strategy_description }
            : null,
          abstract_pattern: s.meta_trend ?? s.visual_strategy_description ?? null,
          keywords: [],
          works_for: [],
          variable_elements: [],
          data_requirements: s.inputs_needed ?? null,
          use_when: null,
          visual_complexity: null,
          section: s.section ?? null,
          position: null,
          title: s.name ?? null
        };

    index.push({
      id,
      deck: deckId,
      section: rec.section,
      position: rec.position,
      intents: rec.intents.slice(0, 4),
      keywords: rec.keywords.slice(0, 8),
      gist: (rec.core_message ?? rec.title ?? '').slice(0, 140)
    });
    return rec;
  });

  writeFileSync(
    join(OUT, 'decks', `${deckId}.json`),
    JSON.stringify(
      {
        deck: deckId,
        company: meta.company_name ?? null,
        narrative_summary: meta.narrative_summary ?? null,
        stage: meta.stage ?? null,
        industry: meta.industry ?? null,
        record_count: records.length,
        records
      },
      null,
      1
    )
  );
  summary.push({ deckId, note: `${records.length} records (${records[0]?.schema})` });
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 0));
writeFileSync(join(PRIVATE, 'image-map.json'), JSON.stringify(imageMap, null, 1));
writeFileSync(
  join(OUT, 'README.md'),
  `# Suade pattern corpus

${index.length} slide-level narrative pattern records across ${summary.filter((s) => !s.note.startsWith('DROPPED')).length} real tier-1 decks.

Each record is an original annotation of a publicly available investor presentation: the slide's core message, communication intent, an abstracted transferable pattern, and \`works_for\` — hand-written cross-industry example messages that act as a semantic index for retrieval by grep. No slide images or wholesale deck text ship here; source decks remain © their issuers (credited via deck ids). See LICENSE.

Known skew: all decks are public-company investor days / business updates. For seed-stage critique, prefer \`abstract_pattern\`-level matches over section/position matches.

Retrieval: load \`index.json\` (small) whole; grep \`works_for\`/\`abstract_pattern\` in \`decks/*.json\` for evidence-set terms; cite records by id (e.g. \`snowflake-investor-day-2025#s006\`).
`
);

console.log(`decks: ${summary.length} | records: ${index.length} | images mapped privately: ${Object.keys(imageMap).length}`);
for (const s of summary) console.log(`  ${s.deckId}: ${s.note}`);
