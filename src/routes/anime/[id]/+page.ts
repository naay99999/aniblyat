import { browser } from '$app/env';
import { error } from '@sveltejs/kit';
import { getMedia } from '#lib/anilist/queries.js';
import { queryClient } from '#lib/anilist/query-client.svelte.js';
import type { PageLoad } from './$types';

// Rendered on the server like the home page, so a shared or searched link opens on the
// finished page instead of a loading line.
export const ssr = true;

// AniList ids are GraphQL Ints; a larger number is a 400 there, and simply not a title here
const MAX_ID = 2 ** 31 - 1;

export const load: PageLoad = async ({ params, fetch }) => {
	if (!/^\d+$/.test(params.id) || Number(params.id) > MAX_ID) error(404);
	const id = Number(params.id);
	const now = Date.now();
	try {
		// in the browser the cache answers a title seen before; SvelteKit's fetch answers
		// the hydrating run from the response inlined by the server render
		const media = browser
			? await queryClient.ensureQueryData({
					queryKey: ['media', id],
					queryFn: () => getMedia(id, { fetch })
				})
			: await getMedia(id, { fetch, maxRetries: 0 });
		return { id, initial: { media, fetchedAt: now } };
	} catch {
		// AniList busy or down: the page's own query retries and shows its state
		return { id, initial: null };
	}
};
