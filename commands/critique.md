---
description: Narrative critique of any deck against a specific audience (YC, board, a16z...). Judges the argument; never generates slides.
argument-hint: <deck.pdf|pptx> [audience-id] [--recheck]
---

Run a Suade deck critique.

Arguments: `$ARGUMENTS` — first token is the deck path; optional second token is an audience lens id (see `${CLAUDE_PLUGIN_ROOT}/data/audiences/_shared/index.md`; e.g. `yc-demo-day`, `board-quarterly`, `a16z`); `--recheck` compares against a prior report.

Follow the deck-critique skill at `${CLAUDE_PLUGIN_ROOT}/skills/deck-critique/SKILL.md` exactly: ingest → load lens → reconstruct spine → lint → score → pattern analogies → write `suade/critique-report.md` → full reference check. If no deck path was given, ask for one.
