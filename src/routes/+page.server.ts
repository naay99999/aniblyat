import { getAiringWindow } from '#lib/anilist/queries.js';
import { cachedHome } from '#lib/server/anilist-cache.js';
import { cached } from '#lib/server/cache.js';
import type { PageServerLoad } from './$types';

// The home page is rendered on the server so the first screen arrives with its covers and
// schedule; only it and the anime page are; every other route stays a client-only SPA.
export const ssr = true;

const TTL = 120_000;

export const load: PageServerLoad = async ({ isDataRequest }) => {
	// a visit from inside the app fetches in the browser, on that visitor's own AniList budget
	if (isDataRequest) return { initial: null };
	const now = Date.now();
	const hour = Math.floor(now / 3600_000);
	try {
		const [home, airing] = await Promise.all([
			cachedHome(),
			cached(`airing:${hour}`, TTL, async () => ({
				value: await getAiringWindow(hour * 3600, hour * 3600 + 86400 + 3600, { maxRetries: 0 }),
				at: Date.now()
			}))
		]);
		return {
			initial: {
				home: home.value,
				airing: airing.value,
				hour,
				fetchedAt: Math.min(home.at, airing.at)
			}
		};
	} catch {
		// AniList busy or down and nothing cached: the client fetches as usual
		return { initial: null };
	}
};
