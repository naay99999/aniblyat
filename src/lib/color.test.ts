import { expect, test } from 'vitest';
import { inkOn } from './color';

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
