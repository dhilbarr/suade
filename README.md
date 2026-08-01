# Suade

**The narrative compiler and deck critic.** Suade architects the argument of a presentation and lints existing decks against the specific audience in the room. It will not paint your slides.

Every deck tool on earth helps you author slides. Almost none of them help with the part that takes 80% of the effort: deciding what the deck argues, in what order, with what emotional arc, for this audience. That thought-layer is Suade's whole job. When the argument is solid, hand it to Gamma, Google Slides, or Claude Design to render — they're good at pixels, and pixels are now free.

## Install

```
/plugin marketplace add dhilbarr/suade
/plugin install suade@suade
```

Works in Claude Code and Claude Cowork (in Cowork, just ask in plain language — "critique this deck for a board audience").

## What it does

- **`/suade:critique <deck.pdf|pptx> [audience]`** — narrative lint of any existing deck, made anywhere. Does the spine hold? Does slide 6 earn slide 7? What does a YC partner object to at slide 4? Every top fix cites an analogous move from a corpus of 900 annotated slides from tier-1 decks (Snowflake, Palantir, MongoDB, Uber...), by record id, so you can see the pattern being invoked.
- **`/suade:blueprint`** *(coming in v0.1.0)* — compile a narrative blueprint from your raw materials: evidence set → strategy → spine, written as `blueprint.md` in your folder. The blueprint is the clay; slides are the stone.
- **`--recheck`** — compare a revised deck against the prior blueprint. Decks are compilation artifacts of upstream work; when the work changes, recompile.

## What it deliberately does not do

Generate slides, pick fonts, place images, export pptx layouts. Rendering is a commodity; judgment isn't.

## Audiences

`yc-demo-day`, `board-quarterly` (shipped first), then `a16z`, `sequoia`, `accel`, `board-monthly`, `all-hands`, `eng-standup`, `generic`. Each lens is real research: decision structures, the actual questions those rooms ask, voice examples.

## Status

v0-dev, week 1 of the reboot. The critique wedge lands first.

## License

Code: MIT. Data: original annotations, licensed separately — see [LICENSE](LICENSE).
