# Suade pattern corpus

900 slide-level narrative pattern records across 14 real tier-1 decks.

Each record is an original annotation of a publicly available investor presentation: the slide's core message, communication intent, an abstracted transferable pattern, and `works_for` — hand-written cross-industry example messages that act as a semantic index for retrieval by grep. No slide images or wholesale deck text ship here; source decks remain © their issuers (credited via deck ids). See LICENSE.

Known skew: all decks are public-company investor days / business updates. For seed-stage critique, prefer `abstract_pattern`-level matches over section/position matches.

Retrieval: load `index.json` (small) whole; grep `works_for`/`abstract_pattern` in `decks/*.json` for evidence-set terms; cite records by id (e.g. `snowflake-investor-day-2025#s006`).
