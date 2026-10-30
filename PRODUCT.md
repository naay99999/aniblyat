# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anime fans who follow the current season and read in Thai or English, served equally. Thai is the base locale and English is a full translation, not a courtesy layer. People arrive to answer a quick question: what airs today, when does the next episode of my show land, what is worth watching this season. They usually check, then leave.

## Product Purpose

aniblyat is a public seasonal-anime tracker at https://aniblyat.naay.cc. It shows what airs this season, counts down to each title's next episode, and lets visitors save the titles they follow to a list. It succeeds when a visitor gets "what's next and when" faster than on AniList itself.

## Positioning

A fast, account-free, bilingual seasonal tracker built around next-episode countdowns. Unlike AniList or MyAnimeList, there is no sign-up, no social layer and no database-browsing depth. The point is the season and the clock.

## Operating Context

- Surfaces: home (hero countdown, next-24-hours airing strip, season count, top 10, next season), `/season/[year]/[season]` with sort and a sticky switcher, `/seasons` back to 2000 plus the next season, `/anime/[id]` detail with a trailer loop, and `/list` (the visitor's saved titles). Search sits in the nav.
- Visitors switch between Thai and English through the nav.
- The watchlist lives in the visitor's browser (localStorage), on that device only.

## Capabilities and Constraints

- Data comes only from the AniList GraphQL API. No other data sources, no scraping, no streaming links.
- AniList allows 30 requests/min per IP. The main pages render on the server through a per-process TTL cache, and in-app navigation fetches in the browser. Design must tolerate rate-limit (429) and loading states. Placeholders keep the shape of the content they replace.
- No accounts or login, ever. The list stays local.
- No ads, analytics or tracking scripts.
- Adult titles are excluded everywhere.
- Stack: SvelteKit + Svelte 5, Tailwind v4, Paraglide (th, en), adapter-node in Docker on a single replica.

## Brand Commitments

- Name: aniblyat. Domain aniblyat.naay.cc.
- UI copy exists in both `messages/th.json` and `messages/en.json`. Every string ships in both languages.

## Evidence on Hand

- Live AniList data (titles, covers, banners, trailers, scores, airing schedules) is the only content.
- The site has no testimonials, user counts or press. Don't invent any.

## Product Principles

1. The clock comes first. The next episode and when it airs is the fastest answer on every surface that has one.
2. No friction to use: no account, no sign-up prompts, no gating.
3. Two languages with equal standing. A layout must hold Thai and English copy of different lengths without either one looking secondary.
4. Respect the shared quota. Prefer cached, server-rendered data, and never design features that fan out API calls per visitor.
5. Show nothing that isn't true. Counts, scores and dates come from AniList as they are.
