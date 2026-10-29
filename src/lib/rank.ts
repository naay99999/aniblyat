import type { MediaCard } from './anilist/queries';
import { displayTitle } from './text';

export type RankedMedia = MediaCard & { unscored: boolean };
export type FormatGroup = 'TV' | 'TV_SHORT' | 'MOVIE' | 'OTHER';
export type SortKey = 'airing' | 'popularity' | 'score' | 'title';

const GROUPS: { group: FormatGroup; label: string }[] = [
	{ group: 'TV', label: 'TV' },
	{ group: 'TV_SHORT', label: 'TV Short' },
	{ group: 'MOVIE', label: 'Movie' },
	{ group: 'OTHER', label: 'OVA / ONA / Special' }
];

/** Top 10 by score; early in a season, fill the gap with the most popular unscored titles. */
export function pickTop10(scored: MediaCard[], popular: MediaCard[]): RankedMedia[] {
	const top: RankedMedia[] = scored
		.filter((m) => m.averageScore != null)
		.slice(0, 10)
		.map((m) => ({ ...m, unscored: false }));
	const seen = new Set(top.map((m) => m.id));
	for (const m of popular) {
		if (top.length >= 10) break;
		if (seen.has(m.id)) continue;
		seen.add(m.id);
		top.push({ ...m, unscored: true });
	}
	return top;
}

function formatGroup(format: MediaCard['format']): FormatGroup {
	return format === 'TV' || format === 'TV_SHORT' || format === 'MOVIE' ? format : 'OTHER';
}

export function groupByFormat(
	list: MediaCard[]
): { group: FormatGroup; label: string; items: MediaCard[] }[] {
	return GROUPS.map(({ group, label }) => ({
		group,
		label,
		items: list.filter((m) => formatGroup(m.format) === group)
	})).filter((g) => g.items.length > 0);
}

const desc = (a: number | null | undefined, b: number | null | undefined) =>
	(b ?? -Infinity) - (a ?? -Infinity);

export function sortMedia(list: MediaCard[], key: SortKey, nowSec: number): MediaCard[] {
	const sorted = [...list];
	switch (key) {
		case 'airing': {
			const next = (m: MediaCard) => {
				const at = m.nextAiringEpisode?.airingAt;
				return at != null && at >= nowSec ? at : null;
			};
			return sorted.sort((a, b) => {
				const na = next(a);
				const nb = next(b);
				if (na != null && nb != null) return na - nb;
				if (na != null) return -1;
				if (nb != null) return 1;
				return desc(a.popularity, b.popularity);
			});
		}
		case 'popularity':
			return sorted.sort((a, b) => desc(a.popularity, b.popularity));
		case 'score':
			return sorted.sort((a, b) => desc(a.averageScore, b.averageScore));
		case 'title':
			return sorted.sort((a, b) =>
				displayTitle(a.title ?? {}).localeCompare(displayTitle(b.title ?? {}))
			);
	}
}
