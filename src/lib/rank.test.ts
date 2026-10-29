import { describe, expect, test } from 'vitest';
import type { MediaCard } from './anilist/queries';
import { groupByFormat, pickTop10, sortMedia } from './rank';

let nextId = 1;
function card(overrides: Partial<MediaCard> = {}): MediaCard {
	return {
		id: nextId++,
		title: { romaji: 'Title', english: null },
		coverImage: { large: null, extraLarge: null, color: null },
		bannerImage: null,
		format: 'TV',
		status: 'RELEASING',
		episodes: null,
		averageScore: 70,
		popularity: 1000,
		genres: [],
		startDate: { year: 2026, month: 10, day: 1 },
		nextAiringEpisode: null,
		isAdult: false,
		...overrides
	};
}

describe('pickTop10', () => {
	test('takes the first 10 scored in input order', () => {
		const scored = Array.from({ length: 12 }, () => card());
		const top = pickTop10(scored, []);
		expect(top.map((m) => m.id)).toEqual(scored.slice(0, 10).map((m) => m.id));
		expect(top.every((m) => !m.unscored)).toBe(true);
	});

	test('fills with distinct popular titles marked unscored', () => {
		const scored = Array.from({ length: 4 }, () => card());
		const popular = [scored[0], scored[1], ...Array.from({ length: 8 }, () => card())];
		const top = pickTop10(scored, popular);
		expect(top).toHaveLength(10);
		expect(top.slice(0, 4).map((m) => m.id)).toEqual(scored.map((m) => m.id));
		expect(top.slice(4).every((m) => m.unscored)).toBe(true);
		expect(new Set(top.map((m) => m.id)).size).toBe(10);
	});

	test('skips null scores in the scored list', () => {
		const scored = [card({ averageScore: null }), card({ averageScore: 80 })];
		const top = pickTop10(scored, []);
		expect(top.map((m) => m.id)).toEqual([scored[1].id]);
	});
});

test('groupByFormat orders TV, TV Short, Movie, Other and drops empty groups', () => {
	const list = ['TV', 'ONA', 'MOVIE', 'TV_SHORT', 'SPECIAL', 'OVA'].map((format) =>
		card({ format: format as MediaCard['format'] })
	);
	const groups = groupByFormat(list);
	expect(groups.map((g) => g.group)).toEqual(['TV', 'TV_SHORT', 'MOVIE', 'OTHER']);
	expect(groups.map((g) => g.label)).toEqual(['TV', 'TV Short', 'Movie', 'OVA / ONA / Special']);
	expect(groups[3].items).toHaveLength(3);
	expect(groupByFormat([card({ format: 'MOVIE' })]).map((g) => g.group)).toEqual(['MOVIE']);
});

describe('sortMedia', () => {
	test("'airing' puts upcoming episodes first by airingAt, then the rest by popularity", () => {
		const a = card({ nextAiringEpisode: { episode: 2, airingAt: 500 } });
		const b = card({ nextAiringEpisode: { episode: 9, airingAt: 200 } });
		const c = card({ status: 'FINISHED', popularity: 10 });
		const d = card({ status: 'NOT_YET_RELEASED', popularity: 99 });
		expect(sortMedia([c, a, d, b], 'airing', 100).map((m) => m.id)).toEqual([
			b.id,
			a.id,
			d.id,
			c.id
		]);
	});

	test("'popularity' and 'score' sort descending with nulls last", () => {
		const a = card({ popularity: 5, averageScore: null });
		const b = card({ popularity: 50, averageScore: 60 });
		const c = card({ popularity: null, averageScore: 90 });
		expect(sortMedia([a, b, c], 'popularity', 0).map((m) => m.id)).toEqual([b.id, a.id, c.id]);
		expect(sortMedia([a, b, c], 'score', 0).map((m) => m.id)).toEqual([c.id, b.id, a.id]);
	});

	test("'title' uses the display title", () => {
		const a = card({ title: { english: 'Zeta', romaji: 'Alpha' } });
		const b = card({ title: { english: null, romaji: 'Beta' } });
		expect(sortMedia([a, b], 'title', 0).map((m) => m.id)).toEqual([b.id, a.id]);
	});

	test('does not mutate the input', () => {
		const list = [card({ popularity: 1 }), card({ popularity: 2 })];
		const before = list.map((m) => m.id);
		sortMedia(list, 'popularity', 0);
		expect(list.map((m) => m.id)).toEqual(before);
	});
});
