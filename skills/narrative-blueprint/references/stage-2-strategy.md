# Stage 2 — narrative strategy selection

Input: `evidence.json` + the audience lens. Output: `strategy.json` (schema: `strategy.schema.json`).

You are selecting a narrative strategy, not writing slides. A strategy is: a name, a theme, an ordered sequence of slide roles, what gets emphasized, and what gets constrained — chosen because of what the evidence is strong at and what this room rewards.

Process:

1. **Read the lens first** (`data/audiences/<id>.md` + its destination file). Note its opening expectation, proof focus, and risks to avoid.
2. **Retrieve exemplars from the pattern corpus.** Grep `${CLAUDE_PLUGIN_ROOT}/data/patterns/decks/*.json` (`works_for`, `abstract_pattern`) for the evidence set's strongest messages; load `index.json` for orientation. Find 2-5 records showing how tier-1 decks sequenced or framed a comparable story. Cite them in `exemplar_refs` with a one-line `why` each. Corpus skew note: the decks are public-company investor materials — borrow moves at the `abstract_pattern` level for seed-stage stories.
3. **Draft 2-3 candidate strategies** (e.g. traction-first momentum story vs problem-first inevitability story), then select ONE. Record the losers in `alternatives_considered` with `why_not` — the user deserves to see the fork.
4. **Write the selected strategy**: `ordered_slide_roles` must satisfy the lens (YC: traction early; board: performance-vs-plan first), `emphasis` names the 2-3 beats that carry the deck, `constraints` names what to hold back (e.g. "no product tour before proof", "one market slide, bottom-up only").
5. **Reality check against gaps.** If the strategy leans on evidence that lives in `gaps`, either pick a different strategy or surface the dependency explicitly in `constraints` ("traction-first requires retention data — currently gap g2").

The strategy's `reasoning` field is the paragraph you would say to the founder to defend this choice. Write it like that.
