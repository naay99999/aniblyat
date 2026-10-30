import { describe, expect, test } from 'vitest';
import type { MediaCard } from './anilist/queries';
import { pickHero, soonest } from './hero-pick';

const NOW = 1_000_000;
let nextId = 1;
function card(airingIn: number | null, overrides: Partial<MediaCard> = {}): MediaCard {
	return {
		id: nextId++,
		title: { romaji: 'Title', english: null },
		coverImage: { large: 'l.jpg', extraLarge: 'xl.jpg', color: null },
		bannerImage: null,
		format: 'TV',
		status: 'RELEASING',
		episodes: null,
		averageScore: 70,
		popularity: 1000,
		genres: [],
		startDate: { year: 2026, month: 10, day: 1 },
		nextAiringEpisode: airingIn == null ? null : { episode: 3, airingAt: NOW + airingIn },
		isAdult: false,
		...overrides
	};
}

describe('soonest', () => {
	test('orders by airing time and keeps three', () => {
		const a = card(300);
		const b = card(100);
		const c = card(200);
		const d = card(400);
		expect(soonest([a, b, c, d], NOW).map((m) => m.id)).toEqual([b.id, c.id, a.id]);
	});

	test('skips titles with no known airing, a passed airing, no cover, or duplicates', () => {
		const none = card(null);
		const past = card(-60);
		const bare = card(50, { coverImage: { large: null, extraLarge: null, color: null } });
		const ok = card(10);
		expect(soonest([none, past, bare, ok, ok], NOW)).toEqual([ok]);
	});
});

describe('pickHero', () => {
	test('uses the soonest saved titles when any has known airing', () => {
		const mine = card(5000);
		const other = card(10);
		const out = pickHero({
			savedIds: [mine.id],
			known: [mine, other],
			season: [other],
			trending: [other],
			nowSec: NOW
		});
		expect(out.reason).toBe('list');
		expect(out.items).toEqual([mine]);
	});

	test('falls back to popular titles when no saved title has known airing', () => {
		const saved = card(null);
		const popular = card(900);
		const out = pickHero({
			savedIds: [saved.id],
			known: [saved],
			season: [popular],
			trending: [],
			nowSec: NOW
		});
		expect(out.reason).toBe('soon');
		expect(out.items).toEqual([popular]);
	});

	test('only the top 20 by popularity compete', () => {
		const crowd = Array.from({ length: 20 }, (_, i) => card(5000 + i, { popularity: 900 }));
		const niche = card(10, { popularity: 1 });
		const out = pickHero({
			savedIds: [],
			known: [],
			season: [...crowd, niche],
			trending: undefined,
			nowSec: NOW
		});
		expect(out.items.map((m) => m.id)).not.toContain(niche.id);
		expect(out.items).toHaveLength(3);
	});

	test('keeps trending once the season list loads, so the hero does not swap titles', () => {
		const t = card(600);
		const sooner = card(60);
		expect(
			pickHero({ savedIds: [], known: [], season: [sooner], trending: [t], nowSec: NOW }).items
		).toEqual([t]);
	});

	test('uses trending before the season list loads, and is empty with nothing airing', () => {
		const t = card(60);
		expect(
			pickHero({ savedIds: [], known: [], season: undefined, trending: [t], nowSec: NOW }).items
		).toEqual([t]);
		expect(
			pickHero({ savedIds: [], known: [], season: [], trending: undefined, nowSec: NOW }).items
		).toEqual([]);
	});
});
