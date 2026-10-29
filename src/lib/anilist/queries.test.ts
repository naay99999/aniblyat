import { describe, expect, test, vi } from 'vitest';
import { getAiringWindow, getMedia, getMediaByIds, getSeason } from './queries';

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function cardJson(id: number, isAdult = false) {
	return {
		id,
		title: { romaji: `T${id}`, english: null },
		coverImage: { large: null, extraLarge: null, color: null },
		bannerImage: null,
		format: 'TV',
		status: 'RELEASING',
		episodes: null,
		averageScore: null,
		popularity: null,
		genres: [],
		startDate: null,
		nextAiringEpisode: null,
		isAdult
	};
}

function bodyOf(call: unknown[]) {
	return JSON.parse((call[1] as RequestInit).body as string) as {
		variables: Record<string, unknown>;
	};
}

describe('getMediaByIds', () => {
	test('chunks by 50, keeps input order, drops missing ids', async () => {
		const ids = Array.from({ length: 120 }, (_, i) => i + 1);
		const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
			const chunk = (JSON.parse(init!.body as string).variables.ids as number[]).filter(
				(id) => id !== 7
			);
			return json({
				data: {
					Page: {
						pageInfo: { hasNextPage: false },
						media: [...chunk].reverse().map((id) => cardJson(id))
					}
				}
			});
		});
		const result = await getMediaByIds(ids, { fetch });
		expect(fetch).toHaveBeenCalledTimes(3);
		expect(fetch.mock.calls.map((c) => (bodyOf(c).variables.ids as number[]).length)).toEqual([
			50, 50, 20
		]);
		expect(result.map((m) => m.id)).toEqual(ids.filter((id) => id !== 7));
	});

	test('empty list makes no request', async () => {
		const fetch = vi.fn();
		expect(await getMediaByIds([], { fetch })).toEqual([]);
		expect(fetch).not.toHaveBeenCalled();
	});
});

test('getAiringWindow excludes adult titles and follows pages', async () => {
	const pages = [
		{
			pageInfo: { hasNextPage: true },
			airingSchedules: [
				{ episode: 1, airingAt: 10, media: cardJson(1) },
				{ episode: 2, airingAt: 20, media: cardJson(2, true) }
			]
		},
		{
			pageInfo: { hasNextPage: false },
			airingSchedules: [{ episode: 3, airingAt: 30, media: cardJson(3) }]
		}
	];
	const fetch = vi.fn(async () => json({ data: { Page: pages.shift() } }));
	const result = await getAiringWindow(0, 100, { fetch });
	expect(result.map((r) => r.media.id)).toEqual([1, 3]);
	expect(bodyOf(fetch.mock.calls[0]).variables).toMatchObject({ from: 0, to: 100, page: 1 });
});

test('getMedia returns null on AniList 404', async () => {
	const fetch = vi.fn(async () =>
		json({ errors: [{ message: 'Not Found.', status: 404 }], data: { Media: null } }, 404)
	);
	expect(await getMedia(999999999, { fetch })).toBeNull();
});

test('getMedia rethrows other errors', async () => {
	const fetch = vi.fn(async () => json({ errors: [{ message: 'boom', status: 500 }] }, 500));
	await expect(getMedia(1, { fetch })).rejects.toThrow('boom');
});

test('getSeason drops a title repeated across a page boundary', async () => {
	const pages = [
		{ pageInfo: { hasNextPage: true }, media: [cardJson(1), cardJson(2)] },
		{ pageInfo: { hasNextPage: false }, media: [cardJson(2), cardJson(3)] }
	];
	const fetch = vi.fn(async () => json({ data: { Page: pages.shift() } }));
	const result = await getSeason({ season: 'FALL', year: 2026 }, { fetch });
	expect(result.map((m) => m.id)).toEqual([1, 2, 3]);
});

test('getAiringWindow drops a repeated episode across a page boundary', async () => {
	const entry = { episode: 1, airingAt: 10, media: cardJson(1) };
	const pages = [
		{ pageInfo: { hasNextPage: true }, airingSchedules: [entry] },
		{ pageInfo: { hasNextPage: false }, airingSchedules: [entry, { ...entry, episode: 2 }] }
	];
	const fetch = vi.fn(async () => json({ data: { Page: pages.shift() } }));
	const result = await getAiringWindow(0, 100, { fetch });
	expect(result.map((r) => `${r.media.id}:${r.episode}`)).toEqual(['1:1', '1:2']);
});
