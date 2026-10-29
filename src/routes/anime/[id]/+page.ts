import { browser } from '$app/env';
import { parseAnimeId } from '#lib/anime-id.js';
import { getMedia } from '#lib/anilist/queries.js';
import { queryClient } from '#lib/anilist/query-client.svelte.js';
import type { PageLoad } from './$types';

// Rendered on the server like the home page, so a shared or searched link opens on the
// finished page instead of a placeholder.
export const ssr = true;

export const load: PageLoad = async ({ params, data, fetch }) => {
	const id = parseAnimeId(params.id);
	// the server render (and the hydration that follows it) already carries the title
	if (data.initial || !browser) return { id, initial: data.initial };
	const queryKey = ['media', id];
	try {
		// a title seen before comes straight from the cache
		const media = await queryClient.ensureQueryData({
			queryKey,
			queryFn: () => getMedia(id, { fetch })
		});
		const fetchedAt = queryClient.getQueryState(queryKey)?.dataUpdatedAt ?? Date.now();
		return { id, initial: { media, fetchedAt } };
	} catch {
		return { id, initial: null };
	}
};
