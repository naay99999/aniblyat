import { error } from '@sveltejs/kit';
import { getSeason } from '#lib/anilist/queries.js';
import { cached } from '#lib/server/cache.js';
import { currentSeason, parseSeasonParams, sameSeason } from '#lib/season.js';
import type { PageServerLoad } from './$types';

const ON_AIR_TTL = 10 * 60_000;
// a season that has ended barely changes: keep it longer
const PAST_TTL = 6 * 60 * 60_000;

export const load: PageServerLoad = async ({ params, isDataRequest }) => {
	const season = parseSeasonParams(params.year, params.season);
	if (!season) error(404);
	// a visit from inside the app fetches in the browser, on that visitor's own AniList budget
	if (isDataRequest) return { initial: null };
	const ttl = sameSeason(season, currentSeason(new Date())) ? ON_AIR_TTL : PAST_TTL;
	try {
		const { media, at } = await cached(`season:${season.year}:${season.season}`, ttl, async () => ({
			media: await getSeason(season, { maxRetries: 0 }),
			at: Date.now()
		}));
		return { initial: { media, fetchedAt: at } };
	} catch {
		// AniList busy or down and nothing cached: the page's own query retries and shows its state
		return { initial: null };
	}
};
