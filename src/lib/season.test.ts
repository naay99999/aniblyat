import { describe, expect, test } from 'vitest';
import {
	currentSeason,
	parseSeasonParams,
	seasonGrid,
	seasonLabel,
	seasonPath,
	shiftSeason
} from './season';

describe('currentSeason', () => {
	test.each([
		[new Date(2026, 9, 30), 'FALL', 2026],
		[new Date(2026, 0, 1), 'WINTER', 2026],
		[new Date(2026, 2, 31), 'WINTER', 2026],
		[new Date(2026, 3, 1), 'SPRING', 2026],
		[new Date(2026, 6, 1), 'SUMMER', 2026]
	])('%s → %s %i', (date, season, year) => {
		expect(currentSeason(date)).toEqual({ season, year });
	});
});

describe('shiftSeason', () => {
	test('forward across the year', () => {
		expect(shiftSeason({ season: 'FALL', year: 2026 }, 1)).toEqual({
			season: 'WINTER',
			year: 2027
		});
	});
	test('backward across the year', () => {
		expect(shiftSeason({ season: 'WINTER', year: 2026 }, -1)).toEqual({
			season: 'FALL',
			year: 2025
		});
	});
	test('several steps', () => {
		expect(shiftSeason({ season: 'SPRING', year: 2026 }, -6)).toEqual({
			season: 'FALL',
			year: 2024
		});
	});
});

describe('parseSeasonParams', () => {
	test('accepts lowercase season and integer year', () => {
		expect(parseSeasonParams('2026', 'fall')).toEqual({ season: 'FALL', year: 2026 });
	});
	test.each([
		['2026', 'autumn'],
		['abc', 'fall'],
		['2026.5', 'fall'],
		['1800', 'fall'],
		['2026', 'FALL'],
		['9999', 'fall']
	])('parseSeasonParams rejects %s/%s', (year, season) => {
		expect(parseSeasonParams(year, season)).toBeNull();
	});
});

test('seasonPath and seasonLabel', () => {
	expect(seasonPath({ season: 'FALL', year: 2026 })).toBe('/season/2026/fall');
	expect(seasonLabel({ season: 'FALL', year: 2026 })).toBe('Fall 2026');
});

describe('seasonGrid', () => {
	const grid = seasonGrid(new Date(2026, 9, 30));
	test('starts at next season year with only seasons up to next season', () => {
		expect(grid[0]).toEqual({ year: 2027, seasons: [{ season: 'WINTER', year: 2027 }] });
	});
	test('full years have 4 seasons in order', () => {
		expect(grid[1].year).toBe(2026);
		expect(grid[1].seasons.map((s) => s.season)).toEqual(['WINTER', 'SPRING', 'SUMMER', 'FALL']);
	});
	test('ends at 2000', () => {
		expect(grid.at(-1)!.year).toBe(2000);
		expect(grid).toHaveLength(28);
	});
});
