# aniblyat

Anime info site on the AniList GraphQL API. SvelteKit 3 + Svelte 5 (runes), Bun, Tailwind v4, Paraglide (`th` base, `en`), TanStack Query, vitest (browser + node).

## Commands

- `bun run dev` / `bun run build` / `bun run preview`
- `bun run check` — svelte-check
- `bun run lint` / `bun run format`
- `bun run test` — unit + component tests
- `bun run codegen` — regenerate `src/lib/gql` after editing queries in `src/lib/anilist`

Use bun, not npm/pnpm/yarn. `bun.lock` is committed and the Docker build installs with `--frozen-lockfile`, so commit it whenever dependencies change.

## Conventions

- Internal hrefs go through `src/lib/paths.ts`; ESLint's `svelte/no-navigation-without-resolve` requires `resolve()`.
- AniList allows 30 requests/min per IP. Home, `/anime/[id]`, `/season/...`, `/seasons` and `/list` render on the server through the in-memory TTL cache in `src/lib/server/cache.ts` / `anilist-cache.ts`. Their server loads return `initial: null` on data requests, so in-app navigation fetches in the browser instead.
- UI strings live in `messages/th.json` and `messages/en.json`.

## Deploy

Production: https://aniblyat.naay.cc — Dokploy on the user's VPS, behind Cloudflare (DNS proxied).

- Dokploy service type **Application** (not Compose), provider GitHub `naay99999/aniblyat`, branch `main`, trigger On Push. Every push to `main` deploys.
- Build Type **Dockerfile**, default path and context. `Dockerfile` builds with bun on `node:24-slim` and runs `node build` (adapter-node) as user `node` on port 3000.
- Environment: only `ORIGIN=https://aniblyat.naay.cc`. `PORT=3000` is set in the Dockerfile. The app reads no other env vars and needs no API keys.
- Domains tab: container port 3000, HTTPS on.
- Keep **one replica**: the server cache is per process, so more replicas split the cache and spend the AniList quota twice.
- Test the image locally with `docker build -t aniblyat . && docker run -p 3000:3000 -e ORIGIN=http://localhost:3000 aniblyat`.
