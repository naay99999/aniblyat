---
name: aniblyat
description: Seasonal anime and next-episode countdowns, as flat posters pinned to a paper wall.
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
    lineHeight: 1.05
    letterSpacing: '-0.04em'
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
spacing:
  space-1: '8px'
  space-2: '16px'
  space-3: '24px'
  space-4: '40px'
  space-5: '64px'
  space-6: '96px'
  gutter: 'clamp(16px, 2.2vw, 32px)'
  section: 'clamp(72px, 4rem + 4vw, 128px)'
components:
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

**Creative North Star: "The Pinned Poster Wall"**

aniblyat is a wall of paper-grey board with key-art posters pinned flat and square to it. The posters supply the colour. The wall stays a warm, quiet grey, and the ink is near-black. Wherever one title holds the stage (the home hero, the bar above it), that cover's own AniList colour floods the ground, and the ink flips to whichever of black or white reads better on it. Nothing is framed, bevelled or lifted. A poster is a rectangle with no border, edge to edge with its cover art.

The hierarchy is all in type and scale, never in chrome. Big type appears only where it is the showpiece: the hero countdown and the footer wordmark. The sections people use (lists, grids, schedules) stay at body size with generous white space. Thai and English share one sans stack, Schibsted Grotesk with Noto Sans Thai, so the two languages sit at equal weight on the same wall.

Motion is small and physical: things rise into place, presses squeeze, saves spring, and covers hand off between pages through view transitions. There are no scroll-pinned scenes and no animated digits on the clock. Everything collapses to its finished state under reduced motion.

**Key Characteristics:**

- Flat, square, borderless: zero radius everywhere, and no outlines on cards, fields or buttons.
- The cover's own colour is the only big colour. The UI chrome keeps to wall grey, ink and one teal.
- State is shown by fill, never by stroke: a saved mark fills teal, a selected option gets a teal wash.
- Body-size type for working sections, display type only for the clock and the footer.
- Tabular numerals wherever time or counts are shown.

## Colors

A warm uncoated-paper neutral set, near-black ink, and one teal spot colour. Saturated colour arrives only through the posters.

### Primary

- **Pin Teal** (`pin-teal`): the single UI accent. It marks the solid action button, a saved bookmark, the list count in the nav, the focus outline and the footer arrows (in its light step). It is the pin that holds a poster, so it appears where the visitor has acted or can act.
- **Pin Teal Deep** (`pin-teal-deep`): hover fill of the teal button, and teal used as text on the wall where the base step lacks contrast.
- **Pin Teal Wash / Tint / Light** (`pin-teal-wash`, `pin-teal-tint`, `pin-teal-light`): a selected search option (wash), text selection, search-match marks and the hover of an unsaved mark (tint), and accents on the ink footer (light).

### Neutral

- **Wall Grey** (`wall-grey`): the page ground, and the text colour on ink blocks.
- **Shelf Grey** (`shelf-grey`): a step darker than the wall. Used for ghost placeholders and cover backgrounds before an image loads.
- **Card White** (`card-white`): the one raised surface, the search results panel floating over the page.
- **Ink** (`ink`): text, the ink button, toasts and the footer slab.
- **Pencil Grey** (`pencil-grey`): secondary text, meaning notes, captions and non-next airing states.

### Named Rules

**The Poster Supplies the Colour Rule.** The UI owns one hue, teal. Any other saturated colour on screen must come from AniList data (a cover, or `coverImage.color`). Never add a second brand hue.

**The Ink Flips Rule.** On a cover-coloured ground, text and buttons take ink or white, whichever has the better WCAG contrast (`inkOn()` in `src/lib/color.ts`). The button inverts the pair: ink fill, ground-coloured label.

## Typography

**Display Font:** Schibsted Grotesk (with Noto Sans Thai, system-ui)
**Body Font:** Schibsted Grotesk (with Noto Sans Thai, system-ui)

**Character:** one grotesque family at three weights (400, 600, 800), set tight. Weight and size carry the hierarchy, and the Thai fallback keeps the two languages on one voice.

### Hierarchy

- **Display** (800, `clamp(90px, 10vw, 160px)`, 0.88): showpieces only. The footer wordmark (stretched to 24.5vw) and the countdown digits, at their own clamp up to 7rem.
- **Headline** (800, up to 4rem, 1.05): the footer's big place links and page headings that act as posters.
- **Title** (800, up to 2.5rem, 1.1): the hero's title name and detail-page titles.
- **Section** (800, up to 2.25rem): headings of the working sections. Kept deliberately smaller than headline.
- **Lead** (400, up to 1.625rem): intro sentences under a page title.
- **Body** (400, ~17–19px, 1.45, -0.01em): everything else, including card titles at weight 600.
- **Label** (600, ~13–14px): nav, meta lines, toasts, units under the countdown cells.

### Named Rules

**The Showpiece-Only Rule.** Display sizes belong to the clock and the footer. A section someone uses to find or pick something gets section or body type, never display.

**The Tabular Time Rule.** Every countdown, time, episode number and count uses `font-variant-numeric: tabular-nums`, so the figures don't jitter as they tick. Only the digit runs take it: colons, full stops and units such as "ชม." stay proportional, or they open up into "06 : 00" and "ชม .".

**The Season Name Rule.** Season names stay in English in both languages ("Fall 2026", "WINTER"), because that is how Thai fans say them. The months beside them are localised. Everything else around a season name is translated.

## Layout

A 12-column grid with a fluid gutter (`spacing.gutter`, 16–32px) and page padding equal to the gutter. The spacing scale is fixed at 8 / 16 / 24 / 40 / 64 / 96, and sections are separated by `spacing.section` (72–128px). The home hero fills the viewport (100svh, 640–960px) and slides up under the sticky bar. On desktop it splits into 7 columns of clock and 5 of cover, and below 900px it stacks with the cover first. The bar is 64px tall, shrinks to 48px once the page scrolls, and holds its slot so the content doesn't jump. Below 720px it is two rows (100px), and the link row folds away while scrolling down. Covers are always 2:3.

## Elevation & Depth

Flat by default. Depth comes from tonal steps (shelf grey under the wall, card white over it) and from ink slabs (toast, footer), not from shadows. Exactly two things carry a shadow, both because they float over content.

### Shadow Vocabulary

- **Float, small** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.18)`): toasts.
- **Float, large** (`box-shadow: 0 16px 40px rgb(10 10 10 / 0.22)`): the search results panel.

### Named Rules

**The Only-What-Floats Rule.** A shadow means the thing is over the page, not on it. Cards, buttons and sections never cast one.

## Shapes

Square everywhere: `rounded.none` on buttons, fields, cards, chips, toasts and countdown cells. There are no borders. Edges come from fill changes against the wall: a translucent `currentColor` 10% field for inputs and countdown cells, solid fills for buttons. The one recurring silhouette is the 2:3 poster. A bookmark glyph (a square-topped flag with a notch) is the save mark.

## Components

### Buttons

Flat, square, quick.

- **Shape:** square corners (0px), at least 44px tall, horizontal padding of 1.25em, weight 600.
- **Primary:** Pin Teal fill with a white label. Hover goes to Pin Teal Deep on fine pointers only.
- **Ink:** an ink fill with a wall-grey label, for the main action on a grey or tinted ground. On the hero it takes the flipped ink/ground pair.
- **Press:** `scale(0.97)` over 140ms with the out-expo ease.
- **Text link:** the underline is hidden at rest and fades in on hover. The current nav page keeps it shown.

### Save Mark

A 44px square bookmark button that sits in the top-right corner of every poster card. When unsaved it is a wall-grey square with an ink outline glyph. When saved it fills Pin Teal and the glyph fills white. A press squeezes it and springs it back past full size (Svelte `Spring`). It also comes as a labelled button variant, which turns ink when saved.

### Cards (Poster Card)

- **Corner Style:** square.
- **Background:** none. The 2:3 cover sits on its `coverImage.color` until the image loads.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none.
- **Internal Padding:** none. Title (body, 600, clamped to 2 lines) and meta (label) stack under the cover with 6px gaps. Hovering scales the cover image to 1.04 inside its frame.

### Inputs / Fields

- **Style:** the search field has no border and no radius. Its fill is `currentColor` at 10%, so it works on any tinted bar. It is 40px tall, with the magnifier inset at the left.
- **Focus:** the fill deepens to 16%, and the forms-plugin ring is removed.
- **Results panel:** Card White with the large float shadow. The active option takes the Pin Teal Wash, and matched text gets a Pin Teal Tint mark.

### Navigation

A sticky bar holds the wordmark (800, -0.04em), centred links in label type, search, and a language toggle. It takes on the hero cover's colour while the hero is behind it (`barTint`). The list link carries a square teal count badge that bumps when the number changes. On phones, the links move to a second, horizontally scrolling row that folds away while scrolling down.

### Countdown (signature)

The hero's clock has four equal square cells (days, hours, minutes, seconds), each a `currentColor` 10% field holding a display-weight number over a label-type unit. The digits change in place with no animation. Screen readers hear a minute-level phrase, not every tick.

### Toast

An ink slab in label type with a wall-grey action button on the right and the small float shadow. It appears at the bottom left.

### Ghost Placeholder

A Shelf Grey block that holds the exact shape of the content AniList hasn't sent yet, pulsing between full and half opacity. It is used for loading and 429 states.

## Do's and Don'ts

### Do:

- **Do** keep every corner at 0px and every surface borderless.
- **Do** let `coverImage.color` tint the stage and bar, and pick the ink with `inkOn()`.
- **Do** use the spacing scale (8 / 16 / 24 / 40 / 64 / 96) and `--section` between sections.
- **Do** use tabular numerals for all times and counts.
- **Do** give every entrance a finished state that holds under `prefers-reduced-motion`.
- **Do** build placeholders as Shelf Grey ghosts in the exact shape of the content.

### Don't:

- **Don't** use white cards, drop shadows on resting surfaces, gradients or glass. They are fastwork's look, which was rejected for this site.
- **Don't** add a second brand hue next to Pin Teal.
- **Don't** use display-size type in sections people work in.
- **Don't** animate the countdown digits or add scroll-pinned, GSAP-style scenes.
- **Don't** show counts on the day buttons of the airing strip.
