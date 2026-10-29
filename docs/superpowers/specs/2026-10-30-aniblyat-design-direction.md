# Design notes — aniblyat (Task 6b)

## Inventory (things only this subject has)

- AniList key art: covers are 2:3 portraits; each has `coverImage.color` (a flat colour sampled from the art)
- the live next-episode countdown (EP n · อีก 2 วัน 3 ชม.) and the weekday/time it airs in Bangkok
- the season itself: Winter/Spring/Summer/Fall + year ("Fall 2026"), 4 cours a year
- the number of shows in a season (Fall 2026: 102)
- the broadcast schedule (a TV guide: time · title · EP · format)
- trending rank, Top 10 score, next season's announced titles
- banners (wide key art) for the detail page / showcase

## Argument (home)

1. Hero: "This season, these are hot right now" → pinned season title over trending covers, each on its own cover colour, caption = live countdown.
2. list: "What airs in the next 24h" → line-up table (time · title · EP · format), one type size.
3. stats: "How big this season is" → one figure: number of shows this season.
4. showcase: "Best of the season" → Top 1–3 full-bleed banner + column card; 4–10 as a real <ol>.
5. gallery: "What's coming next season" → rising triptych of three covers + link.
6. footer: name first, nav links under it.

## Idea

On this page, **each show's own key art and AniList cover colour** becomes **the pinned poster**: the season title holds while covers swap beneath on their own colour, each carrying its live countdown.
Competitor test: a generic anime site has covers in a grid; the season name held over swapping covers + live countdown captions is this page's.

## Live thing

The countdown on every cover/row ticks live (minute) and moves to the next episode without reload; times shown in the viewer's timezone.

## Choices

- Direction: pinned-poster, seed 1803204229 (sheet: .taste-skill/sheet.txt). Options dealt: name-as-monument, place-carries-it, pinned-poster.
- Imagery: AniList covers/banners (real pictures of the subject). Dealt "People" photos NOT used (unrelated to anime).
- Type: Schibsted Grotesk (Latin) + Noto Sans Thai (Thai glyphs; Schibsted has none) — counted as one voice in two scripts.
- Palette: putty #dedad3 / ink #0a0a0a / teal #256f82; panels take coverImage.color.
- App screens (season, detail, list): app sheet "Accent ladder" with palette+type kept (.taste-skill/app-sheet.txt). Ruling: keep the site's top bar instead of the sheet's sidebar shell — it's a browsing site, one nav across page + app screens.
- Footer: crop the wordmark at the bottom, not the top (inspector rule).
