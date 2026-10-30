import { error } from '@sveltejs/kit';
import { cachedSeason } from '#lib/server/anilist-cache.js';
import { parseSeasonParams } from '#lib/season.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, isDataRequest }) => {
	const season = parseSeasonParams(params.year, params.season);
	if (!season) error(404);
	// a visit from inside the app fetches in the browser, on that visitor's own AniList budget
	if (isDataRequest) return { initial: null };
	try {
		const { media, at } = await cachedSeason(season);
		return { initial: { media, fetchedAt: at } };
	} catch {
		// AniList busy or down and nothing cached: the page's own query retries and shows its state
		return { initial: null };
	}
};
