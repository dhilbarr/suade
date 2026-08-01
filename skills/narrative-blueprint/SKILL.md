---
name: narrative-blueprint
description: Use when the user wants to build, architect, structure, or plan a presentation's narrative from raw materials — "build a deck for my board", "turn these notes into a pitch", "structure my series-A story", "compile a blueprint". Compiles source materials into evidence → strategy → a per-slide narrative blueprint, written as files in the user's folder. It produces the argument, not the slides.
---

# Narrative blueprint — compile the argument before anyone touches a slide

You are Suade's compiler. Decks are compilation artifacts of upstream work; this skill runs the compile. The output is a set of files in `<project>/suade/` — the blueprint is the clay the user molds, and the terminal artifact of THIS product. Rendering belongs to the render-handoff skill and external tools.

The prime directive, ported from v1 and non-negotiable at every stage: **extract only what the materials support; where something important is missing, record a gap instead of inventing content.** A blueprint with honest gaps is useful; one with invented traction is a liability in a real room.

Resolve plugin files via `${CLAUDE_PLUGIN_ROOT}` (dev checkout: relative to this file's repo root).

## Inputs

- **Source materials**: whatever the user has — notes, metrics exports, memos, transcripts, an old deck. Ask for a folder or files; do not require any specific format.
- **Audience**: one lens id (`data/audiences/_shared/index.md`). This is required — a blueprint without a room is a generic deck, and generic is the failure mode. If missing, ask one question.
- **Slide count target**: infer from the audience lens (YC demo day ≈ 5-7; quarterly board ≈ 12-20) unless the user states one.

## Workflow

Write every artifact to `<project>/suade/`. After each stage, validate before continuing (`node ${CLAUDE_PLUGIN_ROOT}/scripts/validate.mjs validate <artifact>`; no-script fallback: check against `schemas/*.schema.json` by inspection and note "unvalidated" in the run log). Record stage outcomes in `suade/run-log.json` (`{"stages":[{"name","status","error?"}]}`) — a failed stage is recorded, fixed, and re-run, not skipped.

**0. Sources manifest** → `sources.json`. List every input file with `kind` (notes|metrics|crm|spec|deck|transcript|financials|other) and sha256 (`shasum -a 256`; omit if unavailable). This hash set is what makes `--recheck`/recompile staleness detection possible later.

**1. Evidence extraction** → `evidence.json` + a human-readable `evidence.md` digest. Per [references/stage-1-evidence.md](references/stage-1-evidence.md).

**2. Strategy selection** → `strategy.json`. Per [references/stage-2-strategy.md](references/stage-2-strategy.md). This is where the pattern corpus enters: cite exemplar records by id.

**3. Blueprint compile** → `blueprint.md` (the source of truth), then `node scripts/validate.mjs compile suade/blueprint.md` to derive `blueprint.json`. Format contract: [references/blueprint-format.md](references/blueprint-format.md). Rules: [references/stage-3-blueprint.md](references/stage-3-blueprint.md).

**4. Self-critique** → revise `blueprint.md` in place, log a critique summary. Per [references/stage-4-critique.md](references/stage-4-critique.md) — this stage applies the deck-critique skill's lint rules to the blueprint BEFORE any renderer sees it, and re-compiles after revision.

**5. Present the result.** Show the user the spine table (n, role, core message, grounding), the gaps that need their input, and the unresolved questions. The blueprint is theirs to edit — either by editing `blueprint.md` directly or by asking for changes conversationally; after any edit, re-run `compile` so `blueprint.json` stays derived, and bump `version` in the front-matter on meaningful revisions.

## What good looks like

- Every slide's core message is one sentence; every evidence-requiring role cites `evidence_refs` by id into `evidence.json`.
- Every slide's "Why it earns the next slide" line holds — read them in sequence; they should chain into an inevitable argument.
- Gaps are surfaced loudly in the final message, not buried in JSON.
- The same materials compiled for a different audience would produce a visibly different blueprint (different opening, ordering, emphasis). If it wouldn't, the lens wasn't applied.

## Next steps to offer

- `/suade:critique suade/blueprint.md` for a fresh adversarial pass with pattern analogies.
- `/suade:handoff` (render-handoff skill) to emit Gamma markdown or a Slides outline once the user is happy with the argument.
