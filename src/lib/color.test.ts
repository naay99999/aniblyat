import { expect, test } from 'vitest';
import { heroGround, inkOn } from './color';

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

test('hero ground is a deep tone that keeps the hue of AniList colour', () => {
	const blue = heroGround('#1a78d6');
	const gold = heroGround('#e4ae50');
	for (const g of [blue, gold]) {
		expect(g).toMatch(/^#[0-9a-f]{6}$/);
		expect(inkOn(g)).toBe('#ffffff');
	}
	const [br, , bb] = channels(blue);
	expect(bb).toBeGreaterThan(br);
	const [gr, , gb] = channels(gold);
	expect(gr).toBeGreaterThan(gb);
});

test('hero ground falls back to a dark neutral for missing or malformed colours', () => {
	expect(heroGround(null)).toBe(heroGround('#dedad3'));
	expect(heroGround('teal')).toBe(heroGround('#dedad3'));
	expect(inkOn(heroGround(null))).toBe('#ffffff');
});

test('dark text on light grounds, light text on dark grounds', () => {
	expect(inkOn('#f1e4c9')).toBe('#0a0a0a');
	expect(inkOn('#ffffff')).toBe('#0a0a0a');
	expect(inkOn('#1a2b3c')).toBe('#ffffff');
	expect(inkOn('#e45d5d')).toBe('#0a0a0a');
	expect(inkOn('#3550a1')).toBe('#ffffff');
});

test('falls back to dark text for missing or malformed colours', () => {
	expect(inkOn(null)).toBe('#0a0a0a');
	expect(inkOn('teal')).toBe('#0a0a0a');
});
