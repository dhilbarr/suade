# Suade pattern corpus

900 slide-level narrative pattern records across 14 real tier-1 decks.

Each record is an original annotation of a publicly available investor presentation: the slide's core message, communication intent, an abstracted transferable pattern, and `works_for` — hand-written cross-industry example messages that act as a semantic index for retrieval by grep. No slide images or wholesale deck text ship here; source decks remain © their issuers (credited via deck ids). See LICENSE.

Known skew: all decks are public-company investor days / business updates. For seed-stage critique, prefer `abstract_pattern`-level matches over section/position matches.

**The visual-psychology layer lives here as text.** `shows` (what the slide literally displays) and `abstract_pattern` (the transferable move and why it works on an audience) together encode layout psychology — e.g. a crowded logo wall conveying market density pre-verbally. These fields are the intended source for a blueprint slide's `visual_hint` and for the mechanism line in critique pattern citations. No embeddings are involved by design: at this corpus size, hand-written annotations + grep + the model in the loop outperform vector retrieval, and provenance (real, citable slide ids) is the product's differentiation.

Retrieval: load `index.json` (small) whole; grep `works_for`/`abstract_pattern` in `decks/*.json` for evidence-set terms; cite records by id (e.g. `snowflake-investor-day-2025#s006`).
