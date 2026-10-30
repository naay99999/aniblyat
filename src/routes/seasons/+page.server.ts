import { sortMedia } from '#lib/rank.js';
import { cachedSeason } from '#lib/server/anilist-cache.js';
import { currentSeason } from '#lib/season.js';
import type { PageServerLoad } from './$types';

// Rendered on the server with the faces of the season on air, from the copy the home and
// season pages already keep, so the page's one picture block is there on arrival.
export const ssr = true;

export const load: PageServerLoad = async ({ isDataRequest }) => {
	if (isDataRequest) return { faces: null };
	try {
		const { media } = await cachedSeason(currentSeason(new Date()));
		const faces = sortMedia(media, 'popularity', Math.floor(Date.now() / 1000))
			.filter((md) => md.coverImage?.large)
			.slice(0, 5);
		return { faces };
	} catch {
		return { faces: null };
	}
};
