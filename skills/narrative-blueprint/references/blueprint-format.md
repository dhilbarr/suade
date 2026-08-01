# blueprint.md format contract

`blueprint.md` is the source of truth; `blueprint.json` is DERIVED by `scripts/validate.mjs compile` and never hand-edited. This file documents exactly what the parser accepts — nothing more exists.

## Structure

````markdown
---
deck_title: NovaOps Seed Pitch
audience: yc-demo-day
version: 1
narrative_theme: The ops layer mid-market logistics never got
slide_count_target: 6
---

# <free title — ignored by the parser>

## S1 — <slide title>

```yaml
role: cover
section: opening
emotional_goal: clarity
must_prove:
  - <assertion>
evidence_refs:
  - m1
open_gaps: []
visual_hint: one line for the renderer
```

**Core message:** One sentence.

**Audience job:** What the room must think/feel/decide.

**Why it earns the next slide:** The belief this slide produces.

## S2 — <next slide title>
...

## Assumptions

- <bullet>

## Unresolved questions

- <bullet>
````

## Rules the parser enforces

- Front-matter: `---` fenced block at the very top. Keys: `deck_title`, `audience` (lens id), `version` (integer), `narrative_theme`, `slide_count_target` (integer); optional `destination`, `sources_hash`, `blueprint_id`, `created_at`.
- Slide headings: `## S<n> — <title>` — em dash, en dash, or hyphen all accepted. The `<n>` becomes `slides[].n`; the title text becomes `slides[].title`.
- One ```yaml fence per slide carrying the machine fields: `role`, `section`, `emotional_goal`, `must_prove`, `evidence_refs`, `open_gaps`, `visual_hint`, `optionality`. Enums are defined in `schemas/defs.schema.json`.
- Bold-label prose lines: `**Core message:**`, `**Audience job:**`, `**Why it earns the next slide:**` (alias `**Earns next:**`). Prose wins over the fence if both define the same field.
- `## Assumptions` and `## Unresolved questions` are optional bullet-list sections.

## The YAML dialect (deliberately tiny)

Scalars (`key: value`) and one-level block lists (`key:` followed by `- item` lines) only. Quotes optional and stripped; bare integers become numbers; `[]` is the empty list. No nesting, no multiline strings, no anchors — if a field seems to need those, the field is wrong, not the dialect.
