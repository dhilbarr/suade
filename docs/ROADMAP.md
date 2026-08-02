# Roadmap — executable task queue

Sequenced from the approved 90-day plan (2026-08-02). Weeks 1-2 are DONE (see CONTEXT §4). Any agent picking up work: take the earliest unblocked item, keep commits batched and pushed to `suade-aug-2026`, follow CLAUDE.md working agreements.

## Founder-gated (blocked on Dhilbar, not on agents)

- [ ] Install test: `/plugin marketplace add dhilbarr/suade` → `/plugin install suade@suade` → `/suade:critique <deck.pdf> yc-demo-day`
- [ ] Head-to-head judgment: Suade critique vs vanilla Claude on the same deck (the "is it better?" test; four falsifiable deltas listed in the session notes: provenance, no fabrication, deck-specificity, screenshot-worthiness)
- [ ] Voice + rubric thumbprint (`skills/deck-critique/SKILL.md` Voice paragraph; `references/rubric.md` anchors)
- [ ] The Assignment: message 5 founders, offer a 48h narrative lint. Stop/go: ≥3/5 accept → full speed; <2/5 → freeze day-30+ investment pending diagnosis
- [ ] Cowork sandbox test (do node scripts run? do fallbacks fire?)
- [ ] Tag v0.1.0 (after eyeballing report format) → hand to 5-10 friendly founders
- [ ] README demo GIF (needs a real critique run to record)

## Week 3 — lens editing (bench dependency)

- [ ] Edit `data/audiences/a16z.md`, `sequoia.md`, `accel.md` to critique-ready, same pattern as yc-demo-day: replace RAW header with usage preamble + review checklist (port the corresponding quick-lens from `deck-critique/references/rubric.md` §Investor quick-lenses, then remove that temporary section when all three land), reframe generation-era "your task" tails. Keep the research verbatim — the edit is framing, not rewriting.
- Acceptance: header says "Edited for critique"; checklist present; no instruction addressed to a deck generator remains.

## Day 30 — recompile, rehearse, evals, distribution

- [ ] `narrative-recompile` skill + `commands/recompile.md` + `commands/diff.md`: full recompile (sources re-hashed vs `sources_hash`; stale → re-run stages 1-4) and narrative diff (`suade/diffs/<date>.md`: spine changes, message edits, grounding deltas). Reference: `references/diff-format.md`.
- [ ] `delivery-rehearse` skill + `commands/rehearse.md`: DeliveryPlan from blueprint (per-slide time budget vs the lens's total — YC ≈ 2 min hard cap; pause cues; tone arc; speaker notes). Validates against `schemas/delivery-plan.schema.json`. No camera/audio — ever, in v1.
- [ ] Eval harness (~2 days of plumbing, budget it): `evals/` runner via headless `claude -p`, JSON extraction with ≤1 retry per stage (retries reported), timeouts, per-run token cost cap. **Cross-family judge = OpenAI** (sole OpenAI dependency).
  - Bench A (blueprint, 20 cases): 5 synthetic companies × 4 investor audiences; pairwise differentiation scoring; acceptance = Content/Coherence/Differentiation ≥4 each, avg ≥4.2.
  - Bench B (critique ranking): 5 great decks + 5 scripted-corruption variants seeding the 6 defect classes (uncited metric; evidence-role with zero refs; >1 idea/slide; missing/buried ask; shuffled spine; duplicated claim). Pass = min(great) > max(corrupted) + ≥4/6 defect recall per deck + full reference check on all 10. Contamination guard: bench decks excluded from corpus retrieval (env flag) or sourced off-corpus.
  - Bench B addendum: **analogy-relevance axis** (judge scores cited pattern_refs) — keeps the no-embeddings decision empirical.
- [ ] `.github/workflows/bench.yml`: `npm run bench` on tagged releases; needs `ANTHROPIC_API_KEY` + `OPENAI_API_KEY` secrets; hard cost cap.
- [ ] Official marketplace PR to `claude-plugins-official` — **gated on Bench B passing**, not Bench A.
- [ ] Edit remaining 4 lenses (all-hands, eng-standup, board-monthly, generic).
- [ ] blueprint.md-edit probe: ask v0.1.0 founders whether anyone edited `blueprint.md` by hand; if nobody did, conversational editing is the primary interface and the file is the record — adjust skills' framing accordingly.
- [ ] Cowork walkthrough doc for non-dev users.

## Day 45-60 — corpus growth

- [ ] Port `tools/triage/` from v1 (`scripts/run-archetype-corpus-triage.ts` + `lib/gcp/corpusTriage.ts`, founder-machine only): strip GCS/Vertex, direct API key, local paths. The original annotation prompt is NOT in v1 — reconstruct few-shot from existing `data/patterns/decks/*.json` records.
- [ ] +10 seed-stage decks (Airbnb, Uber seed, Buffer, Front, Figma...) with a quality gate: founder spot-reviews the first 3 generated records against existing corpus records BEFORE batch-running (annotation drift silently degrades the crown-jewel asset).
- [ ] Add `deck_type` facet to records (investor-day | fundraise | keynote | internal) — enables Apple/Google keynote expansion later.

## Day 60 — launch

- [ ] Show HN + X thread: "this lints the narrative; it will not paint your slides."
- [ ] "We linted 10 famous decks" artifact/post (also the Kevin Hale outreach hook).

## Day ~75 — two-door test (premise-2 check)

- [ ] Minimal gated upload endpoint on the old demo shell: invite codes for 30 testers from launch traffic, hard usage cap, ONE serverless function invoking the same surface-agnostic engine. Measurement: moderated sessions/self-report for both doors + test-scoped opt-in completion ping. Decision: upload ≥2× plugin on first-run completion → invest in the second surface. If the endpoint slips, degrade to moderated-only; do not let it eat two weeks.

## Day 90 — v1.0

- [ ] Iterate from usage; tag v1.0; only then evaluate any paid backend (explicitly deferred until here).

## Standing constraints (never on this roadmap)

Pixel rendering · embeddings infra before the documented scale trigger (CONTEXT §3) · Supabase/GCP/Vertex · bare MCP server · accounts/telemetry (sole exception: the day-75 opt-in ping) · camera/audio rehearse.
