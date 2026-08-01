---
description: Emit renderer-ready handoff files (Gamma markdown, Slides outline) from the current blueprint. Suade never paints slides.
argument-hint: [gamma|slides|both]
---

Run a Suade render handoff.

Arguments: `$ARGUMENTS` — optional format selector (`gamma`, `slides`, or `both`; default both). Requires `suade/blueprint.md`; if absent, offer to run `/suade:blueprint` first.

Follow the render-handoff skill at `${CLAUDE_PLUGIN_ROOT}/skills/render-handoff/SKILL.md` exactly, writing to `suade/handoff/`.
