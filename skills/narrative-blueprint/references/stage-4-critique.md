# Stage 4 — self-critique and revision

Input: the freshly compiled blueprint. Output: a REVISED `blueprint.md` (+ recompiled JSON) and a critique summary in the run log and final message.

This is the deck-critique skill turned on our own output before any renderer sees it. Apply `skills/deck-critique/references/lint-rules.md` to the blueprint:

- **Grounding per slide**: count evidence_refs on evidence-requiring roles; grounded ≥2, partial 1, missing 0.
- **Hard fails**: uncited metric in a title or core message; evidence-requiring role with zero refs; core message needing "and"; missing/buried ask (investor and board audiences); order contradicting the strategy's own `ordered_slide_roles`; the same claim on two slides.
- **The earn test**: read the "Why it earns the next slide" chain aloud; flag every link that assumes a belief the prior slide did not produce.
- **Lens checklist**: run the audience lens's review checklist item by item.

Then act as the audience, not the author: at each slide, ask the question this room asks (from the lens) and check the deck has an answer by the time it matters.

Revise the blueprint to fix what you found — reorder, split, merge, rewrite core messages, add evidence refs, or convert an unsupportable slide into a gap surfaced to the user. Recompile. Cap: two critique-revise rounds, then stop and report; endless self-polish is how compilers eat their schedule.

The critique summary (3-6 bullets: what was found, what changed, what remains open) goes verbatim into the final message to the user — the revision must be visible, not silent.
