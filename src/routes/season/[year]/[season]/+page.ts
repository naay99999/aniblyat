import { error } from '@sveltejs/kit';
import { parseSeasonParams } from '#lib/season.js';
import type { PageLoad } from './$types';

// Rendered on the server: a season is three AniList pages, so a shared link should not wait on them
export const ssr = true;

export const load: PageLoad = ({ params, data }) => {
	const season = parseSeasonParams(params.year, params.season);
	if (!season) error(404);
	return { season, initial: data.initial };
};
