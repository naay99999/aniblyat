import { getAiringWindow, getHome } from '#lib/anilist/queries.js';
import type { PageLoad } from './$types';

// The home page is rendered on the server so the first screen arrives with its covers and
// schedule; every other route stays a client-only SPA (see +layout.ts).
export const ssr = true;

export const load: PageLoad = async ({ fetch }) => {
	// runs on the server, then again while hydrating, when SvelteKit answers these fetches
	// from the responses inlined in the page instead of the network
	const now = Date.now();
	const hour = Math.floor(now / 3600_000);
	try {
		const [home, airing] = await Promise.all([
			getHome(new Date(now), { fetch, maxRetries: 0 }),
			getAiringWindow(hour * 3600, hour * 3600 + 86400 + 3600, { fetch, maxRetries: 0 })
		]);
		return { initial: { home, airing, hour, fetchedAt: now } };
	} catch {
		// AniList busy or down: the client fetches as usual
		return { initial: null };
	}
};
