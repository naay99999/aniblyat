import { describe, expect, test } from 'vitest';
import { earliestAiringAt, shouldInvalidate, shouldPersist } from './query-client.svelte';

describe('earliestAiringAt', () => {
	test('finds the minimum airingAt anywhere in the data', () => {
		expect(
			earliestAiringAt({
				a: [{ nextAiringEpisode: { airingAt: 50 } }, { nextAiringEpisode: { airingAt: 20 } }],
				b: { airingAt: 35 }
			})
		).toBe(20);
	});
	test('null when nothing airs', () => {
		expect(earliestAiringAt({ a: [{ nextAiringEpisode: null }] })).toBeNull();
		expect(earliestAiringAt(undefined)).toBeNull();
	});
});

describe('invalidates when airingAt passes', () => {
	test('true once the earliest airing time has passed', () => {
		expect(shouldInvalidate(100, 100, null)).toBe(true);
		expect(shouldInvalidate(100, 150, null)).toBe(true);
	});
	test('false before it airs', () => {
		expect(shouldInvalidate(100, 99, null)).toBe(false);
	});
	test('false when already invalidated for that time', () => {
		expect(shouldInvalidate(100, 150, 100)).toBe(false);
	});
	test('false when nothing airs', () => {
		expect(shouldInvalidate(null, 150, null)).toBe(false);
	});
});

describe('shouldPersist', () => {
	const now = new Date(2026, 9, 30);
	test('keeps home, the watchlist lookup and the current season', () => {
		expect(shouldPersist(['home'], now)).toBe(true);
		expect(shouldPersist(['byIds', 1, 2], now)).toBe(true);
		expect(shouldPersist(['season', 2026, 'FALL'], now)).toBe(true);
	});
	test('skips hourly airing windows, past seasons and detail pages', () => {
		expect(shouldPersist(['airing', 498000], now)).toBe(false);
		expect(shouldPersist(['season', 2019, 'SPRING'], now)).toBe(false);
		expect(shouldPersist(['media', 21], now)).toBe(false);
	});
});
