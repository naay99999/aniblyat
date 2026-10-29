import { describe, expect, test, vi } from 'vitest';
import { AniListError, anilistFetch, fetchAllPages } from './client';

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', ...headers }
	});
}

const QUERY = 'query { Viewer { id } }';

describe('anilistFetch', () => {
	test('returns data on 200', async () => {
		const fetch = vi.fn(async () => json({ data: { Media: { id: 1 } } }));
		const data = await anilistFetch<{ Media: { id: number } }, never>(QUERY, undefined, { fetch });
		expect(data).toEqual({ Media: { id: 1 } });
		const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('https://graphql.anilist.co');
		expect(JSON.parse(init.body as string)).toEqual({ query: QUERY, variables: {} });
	});

	test('retries 429 after Retry-After', async () => {
		const responses = [
			json({ errors: [] }, 429, { 'Retry-After': '2' }),
			json({ data: { ok: true } })
		];
		const fetch = vi.fn(async () => responses.shift()!);
		const sleep = vi.fn(async () => {});
		const data = await anilistFetch(QUERY, undefined, { fetch, sleep });
		expect(sleep).toHaveBeenCalledWith(2000);
		expect(data).toEqual({ ok: true });
	});

	test('gives up after maxRetries', async () => {
		const fetch = vi.fn(async () => json({ errors: [] }, 429, { 'Retry-After': '1' }));
		const sleep = vi.fn(async () => {});
		const err = await anilistFetch(QUERY, undefined, { fetch, sleep, maxRetries: 2 }).catch(
			(e: AniListError) => e
		);
		expect(err).toBeInstanceOf(AniListError);
		expect(err.status).toBe(429);
		expect(err.retryable).toBe(true);
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	test('throws on GraphQL errors', async () => {
		const fetch = vi.fn(async () =>
			json({ errors: [{ message: 'Not Found.', status: 404 }], data: { Media: null } }, 404)
		);
		const err = await anilistFetch(QUERY, undefined, { fetch }).catch((e: AniListError) => e);
		expect(err).toBeInstanceOf(AniListError);
		expect(err.status).toBe(404);
		expect(err.retryable).toBe(false);
		expect(err.message).toBe('Not Found.');
	});
});

describe('fetchAllPages', () => {
	test('follows hasNextPage', async () => {
		const sizes = [50, 50, 2];
		const fetchPage = vi.fn(async (page: number) => ({
			items: Array.from({ length: sizes[page - 1] }, (_, i) => `${page}-${i}`),
			hasNextPage: page < 3
		}));
		const all = await fetchAllPages(fetchPage);
		expect(all).toHaveLength(102);
		expect(fetchPage).toHaveBeenCalledTimes(3);
	});

	test('stops at maxPages', async () => {
		const fetchPage = vi.fn(async () => ({ items: [1], hasNextPage: true }));
		const all = await fetchAllPages(fetchPage, 4);
		expect(all).toHaveLength(4);
		expect(fetchPage).toHaveBeenCalledTimes(4);
	});
});
