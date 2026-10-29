import { error } from '@sveltejs/kit';

// AniList ids are GraphQL Ints; a larger number is a 400 there, and simply not a title here
const MAX_ID = 2 ** 31 - 1;

/** The anime id from a route parameter, or a 404 for anything that cannot be one. */
export function parseAnimeId(param: string): number {
	if (!/^\d+$/.test(param) || Number(param) > MAX_ID) error(404);
	return Number(param);
}
