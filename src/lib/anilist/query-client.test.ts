import { describe, expect, test } from 'vitest';
import { earliestAiringAt, shouldInvalidate } from './query-client.svelte';

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
