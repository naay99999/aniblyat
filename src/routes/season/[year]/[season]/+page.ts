import { error } from '@sveltejs/kit';
import { parseSeasonParams } from '#lib/season.js';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const season = parseSeasonParams(params.year, params.season);
	if (!season) error(404);
	return { season };
};
