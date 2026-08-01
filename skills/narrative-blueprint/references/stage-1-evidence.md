# Stage 1 — evidence extraction

Input: the source materials + `sources.json`. Output: `evidence.json` (schema: `evidence.schema.json`) + `evidence.md` digest.

Read every source fully before extracting. Then build:

- **metrics** — every number that could appear in the deck: id (`m1`, `m2`...), label, value, unit, period, trend, confidence (0-1, your honest read of how solid the source is), `source_refs` (which source file(s) support it). A metric with no source does not go in `metrics`; it goes in `gaps`.
- **claims** — assertions the deck might make (problem, customer, product, market, traction, gtm, moat, team, fundraise, financials, risk): id (`c1`...), text as one clean sentence, category, confidence, `source_refs`.
- **entities** — customers, competitors, markets, products, team members, channels, investors, partners worth naming, with attributes and `source_refs`.
- **sources** — one entry per input (id `src1`..., kind, title, location); this is what `source_refs` point at.
- **gaps** — the important things the materials do NOT support: id (`g1`...), label, severity (high = the room will ask and there is no answer), reason, suggested_fallback. Typical gaps: no retention data, market size asserted but unsourced, no competitive landscape, team credentials missing.

Rules ported from v1, still binding:

1. Only what the materials support. The temptation is strongest on market size and growth rates — resist it there hardest.
2. Confidence is information, not decoration. A 0.4-confidence metric should probably not anchor a slide; say so later.
3. Prefer fewer, well-sourced items over exhaustive weak ones. The blueprint stage can only use what it can defend.

`evidence.md` is the 1-page human digest: strongest proof points, the high-severity gaps, one line on overall evidence health for this audience.
