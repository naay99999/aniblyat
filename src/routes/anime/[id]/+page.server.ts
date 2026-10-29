import { parseAnimeId } from '#lib/anime-id.js';
import { getMedia } from '#lib/anilist/queries.js';
import { cached } from '#lib/server/cache.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, isDataRequest }) => {
	const id = parseAnimeId(params.id);
	// a visit from inside the app fetches in the browser, on that visitor's own AniList budget
	if (isDataRequest) return { initial: null };
	try {
		const { media, at } = await cached(`media:${id}`, 300_000, async () => ({
			media: await getMedia(id, { maxRetries: 0 }),
			at: Date.now()
		}));
		return { initial: { media, fetchedAt: at } };
	} catch {
		// AniList busy or down and nothing cached: the page's own query retries and shows its state
		return { initial: null };
	}
};
