# Narrative lint rules

Ported from the v1 compiler's review module (`blueprintReview.ts`) and the tier-1 handoff spec; adapted from generation-time checks to critique-time checks.

## Evidence grounding (per slide)

Count proof signals on the slide: explicit metrics + named sources/citations.

- **≥ 2 signals → grounded.** Defensible in review.
- **1 signal → partial.** Needs a stronger metric or source trail if the slide is central.
- **0 signals → missing** if the slide's role requires evidence, else partial ("can stay light, but anchors to no evidence").

**Roles that REQUIRE evidence:** `why_now, problem, market, traction, business_model, gtm, moat, competition, team, ask`.

Report deck-level grounding: n grounded / n partial / n missing.

## Hard fails (any one → the deck is not ready for the room)

1. **Uncited metric** — a number presented as fact with no source anywhere in the deck.
2. **Evidence-requiring role with zero proof signals** (per the list above).
3. **More than one core idea on a slide** — if you cannot state the slide's message in one sentence without "and", it is two slides.
4. **Missing or buried ask** — for investor and board audiences: no ask, or the ask appears after the room has stopped deciding.
5. **Shuffled spine** — slide order contradicts the deck's own apparent strategy with no stated reason (e.g. traction claimed as the lead story but first appearing at slide 9).
6. **Duplicated claim** — the same claim/metric re-argued on multiple slides as if new (repetition-as-callback is fine; repetition-as-padding is not).

These six are also the seeded defect classes for the critique benchmark — the critic must catch them when planted.

## The earn test (per adjacent pair)

For each slide N: what belief must the audience hold at the end of N for slide N+1 to land? If slide N does not produce that belief, N+1 is unearned — flag the pair, name the missing belief. A deck where every slide earns the next reads as inevitable; that is the goal state.

## One-idea rule

Every slide has exactly one core message, stateable in one or two sentences. Everything else on the slide is downstream of it (this is the Kevin Hale rule). Flag slides where the visual content and the core message disagree about what the slide is for.

## Audience objections

From the lens's review checklist and research: at each spine beat, name the question this specific room asks. If the deck never answers it, that is a finding with the slide anchor where the question first arises — not where the author might eventually have answered it.

## Soft flags (reviewer attention, not failures)

- Copy too verbose for the room's time budget (lens gives the budget).
- A chart where a statement slide would be stronger, or vice versa.
- Section fatigue: three consecutive slides with the same rhetorical move.
- Jargon the room would have to translate.

## Severity vocabulary

`hard-fail` (from the six), `major` (breaks the argument for this room), `minor` (weakens it). Rank top fixes by what would change the outcome in the room, not by ease of fixing.
