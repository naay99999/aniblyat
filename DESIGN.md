---
name: aniblyat
description: Seasonal anime and next-episode countdowns, set as a Swiss editorial poster.
colors:
  wall-grey: '#dedad3'
  shelf-grey: '#d3cec6'
  card-white: '#ebe8e3'
  ink: '#0a0a0a'
  pencil-grey: '#5c5852'
  pin-teal: '#256f82'
  pin-teal-deep: '#1b5666'
  pin-teal-wash: '#e6f0f2'
  pin-teal-tint: '#cde1e6'
  pin-teal-light: '#9cc3cd'
  on-pin: '#ffffff'
typography:
  poster-head:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(3rem, 1rem + 7.5vw, 9rem) → clamp(2rem, 1rem + 2.8vw, 3.5rem), by title length'
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: '-0.05em'
  page-head:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(3rem, 0.5rem + 7.4vw, 9rem)'
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: '-0.05em'
  display:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(90px, 10vw, 160px)'
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: '-0.05em'
  headline:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 1.3rem + 3.2vw, 4rem)'
    fontWeight: 800
    lineHeight: 1
    letterSpacing: '-0.045em'
  title:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(1.75rem, 1.45rem + 1vw, 2.5rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  section:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.25rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  lead:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)'
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)'
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: '-0.01em'
  label:
    fontFamily: 'Schibsted Grotesk, Noto Sans Thai, system-ui, sans-serif'
    fontSize: 'clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)'
    fontWeight: 600
    lineHeight: 1.3
rounded:
  none: '0px'
rules:
  rule: '3px solid currentColor'
  hairline: '1px solid color-mix(in srgb, currentColor 20%, transparent)'
spacing:
  space-1: '8px'
  space-2: '16px'
  space-3: '24px'
  space-4: '40px'
  space-5: '64px'
  space-6: '96px'
  gutter: 'clamp(16px, 2.2vw, 32px)'
  content-max: '1440px'
  section: 'clamp(72px, 4rem + 4vw, 128px)'
components:
  chapter:
    border: '{rules.rule}'
    padding: '24px 0 0'
    head: '{typography.headline}, columns 1–4'
    matter: 'columns 5–12 (split) or 1–12 under the head (wide)'
  button-primary:
    backgroundColor: '{colors.pin-teal}'
    textColor: '{colors.on-pin}'
    rounded: '{rounded.none}'
    padding: '0 1.25em'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.pin-teal-deep}'
  button-ink:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.wall-grey}'
    rounded: '{rounded.none}'
    padding: '0 1.25em'
    height: '44px'
  save-mark:
    backgroundColor: '{colors.wall-grey}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    size: '44px'
  save-mark-saved:
    backgroundColor: '{colors.pin-teal}'
    textColor: '{colors.on-pin}'
  search-field:
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '0 12px 0 38px'
    height: '40px'
  search-panel:
    backgroundColor: '{colors.card-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '8px'
  toast:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.wall-grey}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '12px 12px 12px 16px'
  list-count:
    backgroundColor: '{colors.pin-teal}'
    textColor: '{colors.on-pin}'
    rounded: '{rounded.none}'
---

# Design System: aniblyat

## Overview

**Creative North Star: "The Swiss Editorial Poster"**

Every screen of aniblyat is set like a well-made poster from the Swiss school: one head in a heavy grotesk at poster scale that takes the eye first, small type arranged around it on a strict grid, a lot of white space, and colour used for a reason. The head pulls the eye; the grid and the white space make the small type agree with it. The result should read as a poster that was thought through, not a page of boxes.

Two kinds of matter share the wall:

- **The poster** is the hero of a page: one title's key art as a hard-edged panel, its name as the head, its facts in small runs above, and a heavy rule closing the foot, where the clock leads.
- **The timetable** is everything people work in: airing strips, poster grids, ranks, facts, the list, the years. It is set at body size on the grid, with hairlines between rows and no boxes around anything.

Thai and English share one sans stack, Schibsted Grotesk with Noto Sans Thai, so the two languages sit at equal weight. Motion stays small and physical (things rise into place, presses squeeze, saves spring, covers hand off between pages) and collapses to its finished state under reduced motion.

**Key Characteristics:**

- One heavy head per section, at poster scale; everything else small. The contrast between them carries the hierarchy.
- Flush left, always. Heads, leads and grids start on the first column; nothing is centred.
- Lines instead of boxes: a heavy rule opens every chapter, hairlines divide rows. No raised panels, no card backgrounds.
- Flat and square: zero radius everywhere, no shadows on resting surfaces, no gradients, no fades on pictures.
- The cover's own colour is the only big colour. The UI keeps to paper, ink and one teal.
- Tabular numerals wherever time or counts are shown.

## Colors

A warm uncoated-paper neutral, near-black ink, and one teal spot colour. Saturated colour arrives only through the posters.

### Grounds

A section sits on one of three grounds, each with one meaning:

- **Paper** (`wall-grey`): the working ground. The default for every section.
- **Cover** (`coverImage.color`, deepened by `heroGround()` for a hero): the stage of one title, and only of that title: a hero, the Top 10 card, the next-up block on the list. Never a section that holds many titles.
- **Ink** (`ink`): a summary or an ending. The season's count and the footer.

### Primary

- **Pin Teal** (`pin-teal`): the single UI accent. It marks the solid action button, a saved bookmark, the list count in the nav, the current season, the focus outline and the footer arrows (in its light step). It appears where the visitor has acted or can act.
- **Pin Teal Deep** (`pin-teal-deep`): hover fill of the teal button, and teal used as text on paper (rank numbers, relation labels, a day label in the airing strip).
- **Pin Teal Wash / Tint / Light** (`pin-teal-wash`, `pin-teal-tint`, `pin-teal-light`): a selected search option, a season cell on hover and the jump chips (wash); text selection and search marks (tint); accents on ink (light).

### Neutral

- **Wall Grey** (`wall-grey`): the paper ground, and the text colour on ink.
- **Shelf Grey** (`shelf-grey`): ghost placeholders, cover backgrounds before an image loads, and the fill that marks the picked rank.
- **Card White** (`card-white`): the one raised surface, the search results panel floating over the page. Nothing that rests on the page uses it.
- **Ink** (`ink`): text, rules, the ink button, toasts and ink sections.
- **Pencil Grey** (`pencil-grey`): secondary text: leads under a head, captions, counts beside a head, labels in a facts table.

### Named Rules

**The Poster Supplies the Colour Rule.** The UI owns one hue, teal. Any other saturated colour on screen must come from AniList data (a cover, or `coverImage.color`). Never add a second brand hue.

**The Ink Flips Rule.** On a cover-coloured ground, text, rules and buttons take ink or white, whichever has the better WCAG contrast (`inkOn()` in `src/lib/color.ts`). The button inverts the pair: ink fill, ground-coloured label.

**The One Stage Rule.** A cover-coloured ground belongs to one title. A section that lists many titles stays on paper or ink and lets the covers themselves carry the colour.

## Typography

**Font:** Schibsted Grotesk (with Noto Sans Thai, system-ui), at 400, 600 and 800, set tight.

### Hierarchy

Three tiers, and no fourth:

- **Poster** (800, tight): the head of a poster and the figures a page is about.
  - `.poster-head` with `t-xl / t-l / t-m / t-s` from `headSize()` in `src/lib/text.ts`: a title in a hero, up to 9rem, stepping down with the title's length so it holds to about three lines.
  - `.page-head`: a page's own name ("FALL 2026", "ทุกซีซัน", "ลิสต์ของฉัน"), up to 9rem.
  - Monument figures: the countdown digits, a score, the season's count, the footer wordmark.
- **Head** (`--text-head`, 800, up to 4rem, -0.045em, line-height 1): the head of every chapter (`.chapter-head`), set flush left in the first four columns.
- **Text**: everything people read or use. Lead (400, up to 1.625rem) for a synopsis or a page's intro; body (400, ~17–19px) for cards, rows and paragraphs, with card titles at 600; label (600, ~13–14px) for kickers, meta lines, units and table labels.

A time in a timetable (the airing strip) is set at the title step (800) because the clock is that row's head.

### Named Rules

**The One Head Rule.** Each section has exactly one head at poster or head size, and it is the first thing the eye lands on. Everything else in the section is text-tier. Never two big heads competing in one block.

**The Small Runs Rule.** Facts around a head (season, format, episodes, studio) are set as separate runs at label size with fixed gaps, not as a sentence joined with dots.

**The Tabular Time Rule.** Every countdown, time, episode number and count uses `font-variant-numeric: tabular-nums`, so the figures don't jitter as they tick. Only the digit runs take it: colons, full stops and units such as "ชม." stay proportional.

**The Season Name Rule.** Season names stay in English in both languages ("Fall 2026", "WINTER"), because that is how Thai fans say them. The months beside them are localised.

## Layout

A 12-column grid with a fluid gutter (`spacing.gutter`, 16–32px) and page padding equal to the gutter. Working sections stop at `spacing.content-max` (1440px) and centre through `.page.capped`, which puts the extra room into the padding so a section's own ground still runs edge to edge. Spacing is fixed at 8 / 16 / 24 / 40 / 64 / 96, and chapters are separated by `spacing.section` (72–128px).

### The chapter

Every section opens the same way (`.chapter` in `src/routes/layout.css`):

- A heavy rule (`--rule`, 3px, `currentColor`) across the content width, then 24px of air.
- The head (`.chapter-head`) in columns 1–4.
- **Split:** the matter (`.chapter-matter`) in columns 5–12, beside the head. For text, facts, short lists. A head beside long matter may hold its place (`.holds`, sticky under the bar).
- **Wide** (`.chapter.wide`): the head in columns 1–8, an aside (controls, a count) at the right of the head in columns 9–12, and the matter under it across all twelve columns. For grids and strips.
- Below 900px everything stacks into one column, head first.

### The poster (hero)

- The sheet of type in columns 1–7 on the cover's deep ground: a kicker of small runs at the top, the poster head in the middle, a foot under a heavy rule with the clock, the actions and the score.
- The cover in columns 8–12 as a hard-edged panel, bled off the top, right and bottom edges. No mask, no fade.
- The home hero and a title's hero share this box exactly (min(100svh, 920px)), so the cover hands off between them in place.
- Below 900px the cover leads at 4:5, edge to edge, and the sheet follows.

The bar is 64px tall, shrinks to 48px once the page scrolls, and holds its slot. Below 720px it is two rows (100px). Covers in grids are always 2:3, and poster grids hold at most six to a row.

## Lines & Depth

Flat. Structure comes from lines and tonal steps, not from boxes or shadows.

- **Rule** (`--rule`, 3px `currentColor`): opens a chapter, closes the foot of a poster, opens a timetable (the list, the years).
- **Hairline** (`.hairline` / `--hairline`, 1px `currentColor` at 20%): divides the rows of a table: facts, ranks, saved titles, years, related titles.
- **Fill** (`currentColor` at 8–10%): a control's resting state (day buttons, arrows, the sort select, countdown cells). It deepens on hover and turns ink or teal when pressed or current.

Exactly two things carry a shadow, because they float over the page:

- **Float, small** (`0 8px 24px rgb(0 0 0 / 0.18)`): toasts.
- **Float, large** (`0 16px 40px rgb(10 10 10 / 0.22)`): the search results panel.

### Named Rules

**The Lines Not Boxes Rule.** Rows are divided by hairlines and sections by rules. Never put a resting card, row or table on a raised or tinted panel.

**The Only-What-Floats Rule.** A shadow means the thing is over the page, not on it.

## Components

### Buttons

- **Shape:** square corners, at least 44px tall, 1.25em of horizontal padding, weight 600.
- **Primary:** Pin Teal with a white label; Pin Teal Deep on hover (fine pointers only).
- **Ink:** ink with a paper label, for the main action on paper. On a cover ground it takes the flipped ink/ground pair.
- **Press:** `scale(0.97)` over 140ms with the out-expo ease.
- **Text link:** underline hidden at rest, shown on hover. On a cover ground and in kickers it stays shown.

### Save Mark

A 44px square bookmark in the top-right corner of every poster card. Unsaved: a paper square with an ink outline glyph. Saved: Pin Teal with a white glyph. A press squeezes it and springs it back (Svelte `Spring`). It also comes as a labelled button, which turns ink when saved.

### Poster Card

A 2:3 cover with no border, no background and no padding, sitting on its `coverImage.color` until the image loads. The title (body, 600, two lines) and meta (label) stack under it. Hovering scales the image to 1.04 inside its frame.

### Tables (facts, ranks, list, years)

Rows on paper with a hairline under each. A label column in pencil grey at label size, a value column at body size, 600. The picked or current row takes a fill (Shelf Grey for a rank, teal for the current season); nothing else does.

### Countdown (signature)

Four equal square cells (days, hours, minutes, seconds), each a `currentColor` 10% field holding a poster-weight number over a label-type unit. The digits change in place with no animation. Screen readers hear a minute-level phrase, not every tick. On a poster it sits under the foot's rule, first.

### Navigation

A sticky bar with the wordmark (800, -0.04em), centred links in label type, search, and a language toggle. It takes on the hero's ground while the hero is behind it (`barTint`). The list link carries a square teal count badge.

### Toast

An ink slab in label type with a paper action button on the right and the small float shadow, at the bottom left.

### Ghost Placeholder

A Shelf Grey block in the exact shape of the content AniList hasn't sent yet, pulsing between full and half opacity, for loading and 429 states.

## Do's and Don'ts

### Do:

- **Do** open every section with a `.chapter`: rule, head at the left, matter beside or under it.
- **Do** give each section one head and keep the rest at text size.
- **Do** set a hero's title with `.poster-head` and `headSize()`, and a page's own name with `.page-head`.
- **Do** keep everything flush left on the 12-column grid.
- **Do** divide rows with hairlines and use fills only for state.
- **Do** let `coverImage.color` tint the stage of one title, and pick the ink with `inkOn()`.
- **Do** use the spacing scale and `--section` between chapters, and let the white space stay empty.
- **Do** use tabular numerals for all times and counts.
- **Do** give every entrance a finished state that holds under `prefers-reduced-motion`.

### Don't:

- **Don't** centre a head, a lead or a group of pictures.
- **Don't** put resting content on raised or tinted panels (`--color-raised` is for the search panel only), and don't use drop shadows on resting surfaces, gradients, glass, or fades on pictures.
- **Don't** add a fourth type tier or a second big head in a section.
- **Don't** add a second brand hue next to Pin Teal.
- **Don't** give a cover-coloured ground to a section that holds many titles.
- **Don't** animate the countdown digits or add new scroll-pinned scenes.
