# Deck ingestion

Goal: a slide inventory — number, title, extractable text, `readable` flag — that the critique can cite without ever fabricating.

## By format

- **PDF** — read natively (visual read). This is the preferred format for every tool's export path. Read every page; page number = slide anchor.
- **PPTX** — run `node ${CLAUDE_PLUGIN_ROOT}/scripts/extract-pptx.mjs <deck.pptx>` (zero-dependency; emits per-slide text + speaker notes as markdown). Text and notes only, no layout — state that limitation in the report's ingestion notes. If scripts can't run (some Cowork sandboxes), ask the user for a PDF export instead: File → Export → PDF in PowerPoint/Keynote.
- **Google Slides** — ask the user for File → Download → PDF. Do not attempt to read a Slides URL.
- **Gamma** — Share → Export → PDF.
- **Markdown / Marp / Slidev** — read directly; `---` separates slides.

## Image-only and flattened decks

Canva and Figma exports are often flattened images per page. Rules:

- A slide with no extractable or visible text is **image-only**: mark `readable: false`, and the report's ingestion notes must say exactly which slides were affected ("slides 4–9 are image-only; critique limited to visible text and structure").
- **Minimum-extractable-text rule:** if more than half the deck is unreadable, stop and tell the user what you can and cannot evaluate before writing a partial critique. A confident critique of an unread deck is fabrication.
- For PDFs read visually, image slides are usually still readable (you can see them) — this rule mainly bites on pptx-without-text and corrupted exports.

## The non-negotiable

Never emit a slide reference, quote, or paraphrase for content that was not actually read. Unreadable content appears only in ingestion notes, never in findings.
