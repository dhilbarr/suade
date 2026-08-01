# Slides outline format (`handoff/slides-outline.md`)

For Gemini in Google Slides (outline-approval flow) and other prompt-driven generators (Claude Design, Copilot). The file is a prompt + outline the user pastes.

Structure:

````markdown
Create a presentation from the outline below.
Constraints: keep the slide count, order, and titles exactly as given; one idea per slide;
do not add slides, stock imagery, or claims that are not in the outline; put the
"Note:" line of each slide into that slide's speaker notes.

Slide 1 — <title>
- <proof bullet>
Note: <core message>. <earns_next>
Visual: <visual_hint>

Slide 2 — <title>
...
````

Rules:

- The constraint preamble is part of the file — generators pad and invent by default; the preamble is the leash.
- Same bullet discipline as Gamma (max 4, evidence not restatement) and the same visible `[GAP: ...]` markers.
- End with the provenance line (deck title, audience, blueprint version, date).

If the user reports the generator ignored constraints (added slides, invented claims), the recovery is `/suade:critique <exported.pdf> --recheck` — the lint against the blueprint will enumerate exactly what drifted.
