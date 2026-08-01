#!/usr/bin/env node
// Suade artifact validator + blueprint compiler. Zero dependencies.
//
//   node scripts/validate.mjs validate <artifact.json> [schema.json]
//   node scripts/validate.mjs compile <blueprint.md> [-o blueprint.json]
//   node scripts/validate.mjs check <suade-dir>
//
// blueprint.md is the source of truth (the clay); `compile` derives
// blueprint.json from it and validates. Never hand-edit blueprint.json.
// The validator implements the JSON-Schema subset our schemas use — if you
// extend a schema, extend the subset here too.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMAS = join(dirname(fileURLToPath(import.meta.url)), '..', 'schemas');
const BY_BASENAME = {
  'sources.json': 'sources.schema.json',
  'evidence.json': 'evidence.schema.json',
  'strategy.json': 'strategy.schema.json',
  'blueprint.json': 'blueprint.schema.json',
  'delivery-plan.json': 'delivery-plan.schema.json',
  'critique-report.json': 'critique-report.schema.json'
};

// ---------- minimal JSON-Schema validator ----------

const schemaCache = new Map();
const loadSchema = (name) => {
  if (!schemaCache.has(name)) schemaCache.set(name, JSON.parse(readFileSync(join(SCHEMAS, name), 'utf8')));
  return schemaCache.get(name);
};

function resolveRef(ref, currentFile) {
  const [file, frag] = ref.includes('#') ? ref.split('#') : [ref, ''];
  const doc = loadSchema(file || currentFile);
  let node = doc;
  for (const part of frag.split('/').filter(Boolean)) node = node?.[part];
  if (!node) throw new Error(`Unresolvable $ref: ${ref}`);
  return { node, file: file || currentFile };
}

function validateNode(value, schema, file, path, errors) {
  if (schema.$ref) {
    const r = resolveRef(schema.$ref, file);
    return validateNode(value, r.node, r.file, path, errors);
  }
  const fail = (msg) => errors.push(`${path || '$'}: ${msg}`);

  if (schema.enum) {
    if (!schema.enum.includes(value)) fail(`must be one of [${schema.enum.join(', ')}], got ${JSON.stringify(value)}`);
    return;
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    const ok = types.some((t) =>
      t === 'integer' ? typeof value === 'number' && Number.isInteger(value) : t === actual
    );
    if (!ok) return fail(`expected ${types.join('|')}, got ${actual}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) fail(`string shorter than ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`does not match ${schema.pattern}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) fail(`below minimum ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) fail(`above maximum ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) fail(`fewer than ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) fail(`more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => validateNode(v, schema.items, file, `${path}[${i}]`, errors));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const req of schema.required ?? []) {
      if (!(req in value)) fail(`missing required "${req}"`);
    }
    if (schema.properties) {
      for (const [k, v] of Object.entries(value)) {
        if (schema.properties[k]) validateNode(v, schema.properties[k], file, path ? `${path}.${k}` : k, errors);
        else if (schema.additionalProperties === false) fail(`unexpected property "${k}"`);
      }
    }
  }
}

export function validate(data, schemaFile) {
  const errors = [];
  validateNode(data, loadSchema(schemaFile), schemaFile, '', errors);
  return errors;
}

// ---------- blueprint.md parser ----------

function parseYamlSubset(text) {
  // Scalars, one-level block lists, quoted strings, ints. That is the whole
  // dialect blueprint-format.md permits.
  const out = {};
  let listKey = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\t/g, '  ');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const li = line.match(/^\s*-\s+(.*)$/);
    if (li && listKey) { out[listKey].push(coerce(li[1])); continue; }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      const [, k, v] = kv;
      if (v === '' || v === '[]') { out[k] = []; listKey = v === '' ? k : null; }
      else { out[k] = coerce(v); listKey = null; }
    }
  }
  return out;
  function coerce(v) {
    const s = v.trim().replace(/^["']|["']$/g, '');
    return /^\d+$/.test(s) ? Number(s) : s;
  }
}

function parseBlueprintMd(md) {
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error('blueprint.md must start with a --- front-matter block');
  const bp = parseYamlSubset(fm[1]);
  bp.slides = [];

  const slideHeads = [...md.matchAll(/^## S(\d+)\s*[—–-]+\s*(.+)$/gm)];
  for (let i = 0; i < slideHeads.length; i++) {
    const h = slideHeads[i];
    const body = md.slice(h.index + h[0].length, slideHeads[i + 1]?.index ?? md.length);
    const fence = body.match(/```ya?ml\n([\s\S]*?)```/);
    const slide = fence ? parseYamlSubset(fence[1]) : {};
    slide.n = Number(h[1]);
    slide.title = h[2].trim();
    const prose = (label) =>
      body.match(new RegExp(`\\*\\*${label}:?\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n## |$)`))?.[1].trim().replace(/\s+/g, ' ');
    slide.core_message = prose('Core message') ?? slide.core_message;
    slide.audience_job = prose('Audience job') ?? slide.audience_job;
    const earns = prose('Why it earns the next slide') ?? prose('Earns next');
    if (earns) slide.earns_next = earns;
    bp.slides.push(slide);
  }

  const bullets = (heading) => {
    const m = md.match(new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=\\n## |$)`, 'm'));
    return m ? [...m[1].matchAll(/^\s*-\s+(.+)$/gm)].map((x) => x[1].trim()) : undefined;
  };
  const assumptions = bullets('Assumptions');
  const unresolved = bullets('Unresolved questions');
  if (assumptions) bp.assumptions = assumptions;
  if (unresolved) bp.unresolved_questions = unresolved;
  return bp;
}

// ---------- CLI ----------

const [, , cmd, target, ...rest] = process.argv;
const report = (name, errors) => {
  if (errors.length === 0) { console.log(`ok: ${name}`); return true; }
  console.error(`FAIL: ${name}`);
  for (const e of errors) console.error(`  - ${e}`);
  return false;
};

if (cmd === 'validate' && target) {
  const schema = rest[0] ? basename(rest[0]) : BY_BASENAME[basename(target)];
  if (!schema) { console.error(`No schema known for ${basename(target)}`); process.exit(2); }
  const ok = report(target, validate(JSON.parse(readFileSync(target, 'utf8')), schema));
  process.exit(ok ? 0 : 1);
} else if (cmd === 'compile' && target) {
  const out = rest[0] === '-o' && rest[1] ? rest[1] : join(dirname(target), 'blueprint.json');
  let bp;
  try { bp = parseBlueprintMd(readFileSync(target, 'utf8')); }
  catch (e) { console.error(`FAIL: ${target}\n  - ${e.message}`); process.exit(1); }
  const errors = validate(bp, 'blueprint.schema.json');
  if (!report(target, errors)) process.exit(1);
  writeFileSync(out, JSON.stringify(bp, null, 1));
  console.log(`compiled → ${out} (${bp.slides.length} slides)`);
} else if (cmd === 'check' && target) {
  let allOk = true;
  for (const f of readdirSync(target)) {
    if (BY_BASENAME[f]) {
      allOk = report(join(target, f), validate(JSON.parse(readFileSync(join(target, f), 'utf8')), BY_BASENAME[f])) && allOk;
    }
  }
  const md = join(target, 'blueprint.md');
  if (existsSync(md)) {
    try { allOk = report(md, validate(parseBlueprintMd(readFileSync(md, 'utf8')), 'blueprint.schema.json')) && allOk; }
    catch (e) { console.error(`FAIL: ${md}\n  - ${e.message}`); allOk = false; }
  }
  process.exit(allOk ? 0 : 1);
} else {
  console.error('Usage:\n  validate <artifact.json> [schema]\n  compile <blueprint.md> [-o out.json]\n  check <suade-dir>');
  process.exit(2);
}
