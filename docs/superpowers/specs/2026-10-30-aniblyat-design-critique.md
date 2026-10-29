ROUND 1 (after inspector rounds; desktop 1440 + phone 390 screenshots with data loaded)
Seen in one second: "FALL 2026" in heavy black over one anime cover on that cover's own colour — a season guide.
Idea (one sentence): each show's own key art and AniList cover colour becomes the pinned poster; the season title holds while covers swap beneath, each carrying its live countdown.
Live thing: countdowns everywhere tick each minute and roll to the next episode without reload (times in the viewer's zone); save/unsave to the list from any card.
Layout words by section: hero=pinned title over swapping portrait / lineup=one-size table / count=one figure owns the screen / top=banner frames with column card + ranked list / next=rising triptych + grid / footer=name last, cropped at the bottom.
Scores: design 7 · usability 7.5 · creativity 7 · content 7.5 → overall 7.2.
Caps applied: none (title readable, margins equal, every section headed).
Top three problems (most visible first):

1. First paint before AniList answers: hero shows an empty grey portrait block and "กำลังโหลด…" (inspector 1440 fold). Fix later: SSR/prerender the public data, or a skeleton that carries the season count; persisted cache already makes every later visit instant.
2. Top 3 frames: AniList banners are 1900×400, so the full-width band is upscaled ~1.4× at 1440 and the colour field under it is plain (desktop top frames). Fix: smaller band height or use the band at native size with the card overlapping more.
3. Next-season triptych begins with pictures low in the stage, so its first screen is heading + lots of ground until the scroll lifts them (desktop next). Fix: start the outer pictures higher or shorten the pin from 200svh to 160svh.

ROUND 2 (after home SSR; inspector on production preview: 0 FAIL at 1440/768/390, 3 WARN)
Seen in one second: "FALL 2026" over a trending cover on its own colour, with the plain line "อนิเมะ Fall 2026 ที่กำลังฉาย นับถอยหลังทุกตอน" under it — now on the very first paint.
Idea (one sentence): unchanged — each show's key art and cover colour becomes the pinned poster under the held season title.
Live thing: unchanged — live countdowns and save-to-list everywhere.
Layout words by section: hero=pinned title over swapping portrait / lineup=one-size table / count=one figure / top=banner frames + column card + ranked list / next=rising triptych + grid / footer=name last.
Scores: design 7.5 · usability 8 · creativity 7 · content 7.5 → overall 7.5.
Caps applied: none.
WARNs defended: no-footage — no licensed clip of these shows exists to loop; trailers are on each detail page. long-pin (3 screens) — every screen brings a new cover, ground colour and caption. blank-gap 420px on phone — the gap before the footer, under half a screen.
Top three problems (most visible first):

1. Phone hero lead breaks Thai mid-word ("นับถอยหลังทุก / ตอน") at 390 (mobile-fold). Fix: shorten the line or wrap with word-break hints.
2. Top 3 card on 1440 sits low enough that its save button falls into the next frame's top edge in some scroll positions (desktop-page-02). Fix: align card to the banner's lower half.
3. Season-count figure still arrives a moment after first paint (3 client requests). Fix: render it on the server too, or count from a lighter query.
