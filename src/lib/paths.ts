import { resolve } from '$app/paths';
import type { Season } from './season';

export const homePath = () => resolve('/');
export const seasonsPath = () => resolve('/seasons');
export const listPath = () => resolve('/list');
export const animePath = (id: number) => resolve('/anime/[id]', { id: String(id) });
export const seasonHref = (s: Season) =>
	resolve('/season/[year]/[season]', { year: String(s.year), season: s.season.toLowerCase() });
