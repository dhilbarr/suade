---
name: render-handoff
description: Use when the user wants to turn a Suade blueprint into an actual deck — "export to Gamma", "get this into Google Slides", "hand off for rendering", "make the slides now". Emits renderer-ready handoff files (Gamma markdown, Slides outline) from blueprint.md. Suade never paints slides; this is the boundary where renderers take over.
---

# Render handoff — where Suade stops and renderers start

Input: `suade/blueprint.md` (compile it first if only sources exist — narrative-blueprint skill). Output: files in `suade/handoff/` that carry the ARGUMENT into tools that are good at pixels. The handoff transfers narrative faithfully: titles stay claims, one idea per card, evidence stays attached. It does not specify fonts, colors, or layouts beyond the blueprint's one-line `visual_hint`.

Formats (write the ones the user asks for; both if unspecified):

- **`handoff/gamma.md`** per [references/gamma-format.md](references/gamma-format.md) — paste-ready for Gamma's "Paste in text" / import flow.
- **`handoff/slides-outline.md`** per [references/slides-outline.md](references/slides-outline.md) — outline + prompt preamble for Gemini in Google Slides (or Claude Design / any prompt-driven generator).

Rules:

1. Titles are the blueprint's slide titles verbatim (they are already claims). Body bullets come from `must_prove` + the cited evidence, max 4 per slide, each a fact not a fragment of the core message re-worded.
2. The core message travels as the speaker-note line for the slide, along with any `earns_next` transition note.
3. `visual_hint` rides along as a bracketed hint the human (or generator) may use or ignore.
4. Slides with open gaps carry a visible `[GAP: ...]` marker — the renderer must not paper over missing evidence with stock content.
5. End every handoff file with the provenance line: deck title, audience, blueprint version, date — so a rendered deck can be traced back to the blueprint that compiled it.

After writing, tell the user exactly where to paste each file and offer `/suade:critique <exported.pdf> --recheck` once they have a rendered deck back — the loop closes by re-linting the rendered artifact against the same blueprint.
