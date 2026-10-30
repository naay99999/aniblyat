import { airingStatus } from './airing';
import type { MediaCard } from './anilist/queries';
import { sortMedia } from './rank';

export type HeroReason = 'list' | 'soon';
export type HeroPick = { items: MediaCard[]; reason: HeroReason };

const STEPS = 3;
const POPULAR = 20;

/** The soonest upcoming episodes of the pool, one per title, soonest first. */
export function soonest(pool: MediaCard[], nowSec: number, limit = STEPS): MediaCard[] {
	const seen = new Set<number>();
	const upcoming: { media: MediaCard; at: number }[] = [];
	for (const media of pool) {
		if (seen.has(media.id) || media.isAdult) continue;
		seen.add(media.id);
		if (!(media.coverImage?.extraLarge ?? media.coverImage?.large)) continue;
		const status = airingStatus(media, nowSec);
		if (status.kind === 'next' && status.airingAt >= nowSec) {
			upcoming.push({ media, at: status.airingAt });
		}
	}
	return upcoming
		.sort((a, b) => a.at - b.at)
		.slice(0, limit)
		.map((u) => u.media);
}

/**
 * The next episodes that matter to this visitor: the soonest among their saved titles whose
 * airing is known, else among what is trending. `trending` comes with the server render, so
 * a first visit doesn't swap titles when the season list arrives a moment later; the season's
 * most popular airing titles only stand in when nothing trending airs. `known` lists every
 * card we already hold. Nothing here fetches.
 */
export function pickHero(opts: {
	savedIds: number[];
	known: MediaCard[];
	season: MediaCard[] | undefined;
	trending: MediaCard[] | undefined;
	nowSec: number;
}): HeroPick {
	const { savedIds, known, season, trending, nowSec } = opts;
	if (savedIds.length) {
		const saved = new Set(savedIds);
		const mine = soonest(
			known.filter((m) => saved.has(m.id)),
			nowSec
		);
		if (mine.length) return { items: mine, reason: 'list' };
	}
	const items = soonest(trending ?? [], nowSec);
	if (items.length) return { items, reason: 'soon' };
	const popular = season ? sortMedia(season, 'popularity', nowSec).slice(0, POPULAR) : [];
	return { items: soonest(popular, nowSec), reason: 'soon' };
}
