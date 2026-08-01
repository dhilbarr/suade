# Stage 3 — blueprint compile

Input: `evidence.json` + `strategy.json` + the lens. Output: `blueprint.md` per [blueprint-format.md](blueprint-format.md), then derived `blueprint.json` via `validate.mjs compile`.

One slide per role in `strategy.ordered_slide_roles`, in order. For each slide:

- **Title** — the slide's headline as it should appear in the room: a claim, not a label ("Revenue grew 4x to $1.2M ARR", never "Traction").
- **Core message** — ONE sentence. If it needs "and", it is two slides; split or cut. This is the Kevin Hale rule and the single most enforced line in the file.
- **Audience job** — what the room must think, feel, or decide by the end of this slide, phrased from their side ("Believe the product works today").
- **Why it earns the next slide** — the belief this slide produces that the next slide spends. Read the chain end-to-end after drafting; where a link is weak, reorder or add connective tissue. This line is what makes the blueprint reviewable.
- **emotional_goal** — one of the schema enum; the arc across slides should vary deliberately (urgency → belief → momentum → confidence is a healthy investor shape).
- **must_prove** — the specific assertions this slide is on the hook for.
- **evidence_refs** — ids from `evidence.json` (`m*`, `c*`, entity ids). Evidence-requiring roles (why_now, problem, market, traction, business_model, gtm, moat, competition, team, ask) need ≥1 ref, ideally 2+. **Never cite an id that does not exist in evidence.json** — the critique skill's grounding check will run against these.
- **open_gaps** — gap ids from `evidence.json` this slide depends on. A slide may ship with an open gap; it may not ship with an invented fact.
- **visual_hint** — optional, one plain-English line for the eventual renderer ("single big number", "before/after two-panel"). No chart specs, no layout coordinates: pixels are not our layer.

Deck-level: `narrative_theme` carries over from the strategy; `assumptions` and `unresolved_questions` collect what the user must confirm. Front-matter `version` starts at 1.

After writing `blueprint.md`, run `compile` and fix any validation failure at the markdown source, never by hand-editing the JSON.
