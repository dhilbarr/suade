# Suade v2 — full context for continuing agents

Last updated: 2026-08-03 · Active branch: `suade-aug-2026` · State: weeks 1-2 of the 90-day plan complete, dogfooded, pushed.

## 1. What this product is, and why this shape

**One line:** Suade architects and lints the *argument* of a presentation for a specific audience. It will not paint slides.

**The founder's two theses (Dhilbar Roshan, held since v1):**
1. Decks are compilation artifacts of upstream work — "CI/CD for decks." When the work changes, recompile the narrative and diff it.
2. ~80% of deck effort is the narrative-architecture "clay" phase (what to argue, in what order, with what emotional arc, for this room), and no tool serves it.

**Why judgment-only (decided 2026-08-02, after a full audit + market scan):**
- Generation is commodity: Gemini lives in Slides, ChatGPT in PowerPoint, Claude Design exports pptx, Canva/Copilot everywhere. The generator business below Gamma ($100M ARR) is dead — Tome shut down, Pitch retrenched. ~12 "Claude deck generator" plugins shipped H1 2026; none cleared 15 GitHub stars.
- v1's own recorded finding (March 2026): freeform LLM slide rendering "failed the quality bar... a renderer-path failure." The template-library alternative needs a content team a solo founder doesn't have.
- The unserved lane is **narrative judgment** — nobody lints deck arguments for board/sales/conference/internal rooms, and unreviewed AI-generated decks are exploding. Criticism appreciates as generation commoditizes.

**Form factor:** free Claude Code plugin whose skills also work conversationally in Cowork. The plugin is **channel #1, not the product boundary** — the engine (lenses + corpus + schemas + scripts) stays surface-agnostic; a 30-user two-door test (plugin vs drag-and-drop upload on a demo shell) is scheduled ~day 75.

**Files are the product.** Artifacts live in the user's folder under `suade/`: `sources.json`, `evidence.json`+`.md`, `strategy.json`, **`blueprint.md`** (the clay; source of truth), derived `blueprint.json`, `critique-report.md`+`.json`, `handoff/`. Diffable, recompilable, versioned by the user's own git.

**Critique is the wedge; blueprint is the core loop.** `/suade:critique <any deck>` works day one on anyone's deck with zero setup. Every failed deck plugin was a generator; nobody shipped a critic.

## 2. The two crown-jewel data assets

Both salvaged from v1 (`~/Developer/suade-ai-anthropic-sdk`, branch `anthropic-sdk` — **exists only on the founder's machine**; treat as read-only salvage source).

1. **Audience lenses** (`data/audiences/`) — ~92K tokens of hand-written audience research extracted from v1's `aiService.ts`: decision structures, the actual questions each room asks, voice examples. 13 files. `yc-demo-day` and `board-quarterly` have had their critique edit (usage preamble + review checklist, generation-era framing removed); the other 11 are marked RAW EXTRACTION in their headers and need the same pass.
2. **Pattern corpus** (`data/patterns/`) — 900 slide-level annotations across 14 real tier-1 decks (Snowflake, MongoDB, Adobe, CrowdStrike, Cloudflare, Palantir ×2, Square ×2, Uber, TradeDesk, HubSpot, Nubank, Snap). Each record: core message, communication intent, `abstract_pattern` (the transferable move and why it works), `works_for` (hand-written cross-industry example messages — functions as a semantic index), `shows` (what the slide literally displays). Ids are stable: `<deck>#sNNN`. Slide-image URLs are stripped from shipped data (copyright posture; founder-local map in gitignored `tools/corpus-private/`). Known skew: all public-company decks; seed-stage decks are a roadmap acquisition.

**The visual-psychology layer is text, not vectors.** `shows` + `abstract_pattern` encode layout psychology (e.g. a crowded logo wall conveying market density pre-verbally). Blueprint's `visual_hint` and critique's citation mechanism lines draw from these fields.

## 3. Decisions log (with rationale — do not silently relitigate)

| Decision | Rationale | Revisit trigger |
|---|---|---|
| No rendering, ever, in this product | Every AI tool loses on pixels; renderers are free commodities; hand off via `render-handoff` | none |
| No embeddings; grep + model-in-loop retrieval | Zero vectors were ever generated in v1 (verified); 418KB index fits in context; `works_for` is a hand-written semantic index; provenance (citable ids) is the moat, and it lives in annotations | corpus >3-5K records OR measured analogy-relevance degradation → build-time local embeddings in `corpus-search.mjs`, never Vertex/Supabase |
| `blueprint.md` is source of truth; JSON derived | The clay must be human-editable; machines get the compiled form | none |
| One canonical role enum in `schemas/defs.schema.json` | critique of a rendered deck must diff against the blueprint that compiled it | none |
| Zero runtime deps + no-script fallbacks | Cowork sandboxes may not run node; keyless operation is the install story | none |
| Corpus/README generated by `tools/build-corpus.mjs` | regeneration doubles as an integrity check (900 records, 0 dupes) | none |
| Critic voice + rubric anchors = founder-taste zones | The product's personality is the founder's judgment | founder edit only |
| Ship-first testing, no browser/localhost loops | Founder directive: token-expensive, brittle; prod + logs instead | none |
| OpenAI appears ONLY as cross-family eval judge | Claude output must not be self-graded | none |

## 4. What is built and verified (weeks 1-2, commits `1f69fdd..bfd0fe5`)

- Plugin scaffold: `.claude-plugin/{plugin.json,marketplace.json}`, installable via `/plugin marketplace add dhilbarr/suade`.
- `deck-critique` skill + `/suade:critique`: ingest (PDF native / pptx via zero-dep extractor / image-only degradation rules) → lens → spine reconstruction → lint (grounding rule, 6 hard-fail classes, earn test) → 3-axis scores → corpus analogies by record id with mechanism lines → report + full reference check. Minimal `--recheck` mode specced in the skill.
- `narrative-blueprint` skill + `/suade:blueprint`: sources manifest → evidence (gap-not-hallucination) → strategy (corpus exemplars cited) → `blueprint.md` compile → self-critique using deck-critique's own lint rules (2-round cap).
- `render-handoff` skill + `/suade:handoff`: Gamma cards + Gemini-in-Slides outline, constraint preambles, visible `[GAP]` markers, provenance line.
- Six schemas + `scripts/validate.mjs` (validator + blueprint.md→json compiler). Verified: fixture round-trips; corrupted fixture fails loudly; critique-report sample validates.
- `scripts/extract-pptx.mjs`: zero-dep pptx text+notes extractor, tested against a constructed pptx.
- **Dogfood run #1** (founder's real deck, `~/Documents/dpicorp-deck-1.pdf`, report in `~/Documents/suade/`): produced a full report (verdict: not ready — ask buried after the Thank-you slide; projection drawn as traction; missing team slide) AND surfaced two real corpus bugs (malformed id `#s0Q4`, duplicate id from double-numbered source slides) — both fixed in `build-corpus.mjs`.

## 5. Quality bars

- Founder's bar: McKinsey / tier-1 VC quality. Direct, specific, evidence-first voice; no generic deck advice.
- **Never fabricate a reference.** Full check before any report ships: every slide anchor real, every pattern id present in `index.json`.
- A critique must be *falsifiably specific to this deck*; the differentiation axis exists because a deck that wouldn't change per room is optimized for none.
- Same materials + different lens must produce visibly different blueprints, or the lens wasn't applied.

## 6. Known gaps / candor for the next agent

- The skills have run end-to-end exactly once (dogfood #1, driven in-session, not through an installed plugin). The installed-plugin path and Cowork sandbox are untested (founder-gated).
- 11 of 13 lenses are raw extractions; the day-30 benchmark depends on 3 of them being edited (week-3 task).
- `evals/` is an empty directory; the bench spec lives in ROADMAP §Day-30.
- `tools/triage/` (corpus growth) is not yet ported; its v1 sources are founder-machine-local.
- `index.json` is 418KB (docs elsewhere may say ~250KB; 418KB is correct).
- uber-2021 archetype file was dropped as unrecoverable (spurious outer brace + deeper corruption); corpus is 14 decks, exactly 900 records.
