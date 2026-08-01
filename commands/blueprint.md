---
description: Compile a narrative blueprint (evidence → strategy → spine) from source materials for a specific audience. Files-first; produces the argument, not slides.
argument-hint: [source-folder-or-files] [audience-id]
---

Run a Suade blueprint compile.

Arguments: `$ARGUMENTS` — source materials path(s) and an audience lens id (see `${CLAUDE_PLUGIN_ROOT}/data/audiences/_shared/index.md`). Ask for whichever is missing; audience is required.

Follow the narrative-blueprint skill at `${CLAUDE_PLUGIN_ROOT}/skills/narrative-blueprint/SKILL.md` exactly: sources manifest → evidence → strategy (corpus exemplars cited by id) → blueprint.md compile → self-critique revision → present spine + gaps.
