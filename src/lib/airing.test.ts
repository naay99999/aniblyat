import { describe, expect, test } from 'vitest';
import {
	airingStatus,
	formatAirTime,
	formatCountdown,
	formatFuzzyDate,
	statusLabel,
	type AiringInput
} from './airing';

describe('formatCountdown', () => {
	test.each([
		[183600, 'อีก 2 วัน 3 ชม.'],
		[7380, 'อีก 2 ชม. 3 นาที'],
		[59, 'อีก 1 นาที'],
		[0, 'กำลังจะฉาย']
	])('%i → %s', (seconds, label) => {
		expect(formatCountdown(seconds)).toBe(label);
	});
});

test('formatAirTime uses short weekday and 24h time in the given zone', () => {
	expect(formatAirTime(1793455200, undefined, 'Asia/Bangkok')).toBe('เสาร์ 21:00');
});

describe('formatFuzzyDate', () => {
	test('full date', () => {
		expect(formatFuzzyDate({ year: 2027, month: 1, day: 10 })).toBe('10 ม.ค. 2027');
	});
	test('month and year', () => {
		expect(formatFuzzyDate({ year: 2027, month: 1, day: null })).toBe('ม.ค. 2027');
	});
	test('year only', () => {
		expect(formatFuzzyDate({ year: 2027, month: null, day: null })).toBe('2027');
	});
	test('nothing known', () => {
		expect(formatFuzzyDate({ year: null, month: null, day: null })).toBeNull();
		expect(formatFuzzyDate(null)).toBeNull();
	});
});

const base: AiringInput = { status: 'RELEASING', nextAiringEpisode: null, startDate: null };

describe('airingStatus', () => {
	test('releasing with next episode', () => {
		expect(
			airingStatus({ ...base, nextAiringEpisode: { episode: 5, airingAt: 1000 } }, 400)
		).toEqual({ kind: 'next', episode: 5, airingAt: 1000, secondsLeft: 600 });
	});
	test('airingAt in the past clamps to 0', () => {
		expect(
			airingStatus({ ...base, nextAiringEpisode: { episode: 5, airingAt: 1000 } }, 5000)
		).toMatchObject({ kind: 'next', secondsLeft: 0 });
	});
	test.each([
		['RELEASING', 'airing'],
		['NOT_YET_RELEASED', 'upcoming'],
		['FINISHED', 'finished'],
		['HIATUS', 'hiatus'],
		['CANCELLED', 'cancelled'],
		[null, 'unknown']
	])('%s → %s', (status, kind) => {
		expect(airingStatus({ ...base, status }, 0).kind).toBe(kind);
	});
});

describe('statusLabel', () => {
	test.each([
		[{ kind: 'next', episode: 5, airingAt: 0, secondsLeft: 183600 }, 'EP 5 · อีก 2 วัน 3 ชม.'],
		[{ kind: 'airing' }, 'กำลังฉาย'],
		[{ kind: 'upcoming', startDate: { year: 2027, month: 1, day: 10 } }, 'เริ่มฉาย 10 ม.ค. 2027'],
		[{ kind: 'upcoming', startDate: null }, 'ยังไม่ประกาศวัน'],
		[{ kind: 'finished' }, 'จบแล้ว'],
		[{ kind: 'hiatus' }, 'พักฉาย'],
		[{ kind: 'cancelled' }, 'ยกเลิก']
	] as const)('%o', (status, label) => {
		expect(statusLabel(status)).toBe(label);
	});
});
