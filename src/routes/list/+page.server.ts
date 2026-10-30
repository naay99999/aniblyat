import { cachedHome } from '#lib/server/anilist-cache.js';
import type { PageServerLoad } from './$types';

// The list itself lives in the browser; an empty one starts from what is trending, taken from
// the server's copy the home page keeps instead of a fresh AniList read in each browser.
export const load: PageServerLoad = async () => {
	try {
		const { value, at } = await cachedHome();
		return { home: value, fetchedAt: at };
	} catch {
		return { home: null, fetchedAt: 0 };
	}
};
