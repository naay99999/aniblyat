import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (!/^\d+$/.test(params.id)) error(404);
	return { id: Number(params.id) };
};
