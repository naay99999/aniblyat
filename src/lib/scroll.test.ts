import { expect, test } from 'vitest';
import { activeIndex, pinProgress } from './scroll';

test('pinProgress is 0 before the pin, 1 after, linear between', () => {
	// wrapper 3000px tall, viewport 1000px → 2000px of travel
	expect(pinProgress(100, 3000, 1000)).toBe(0);
	expect(pinProgress(0, 3000, 1000)).toBe(0);
	expect(pinProgress(-1000, 3000, 1000)).toBe(0.5);
	expect(pinProgress(-2000, 3000, 1000)).toBe(1);
	expect(pinProgress(-5000, 3000, 1000)).toBe(1);
});

test('pinProgress of a wrapper no taller than the viewport is 0', () => {
	expect(pinProgress(-10, 800, 1000)).toBe(0);
});

test('activeIndex splits progress into equal steps', () => {
	expect(activeIndex(0, 5)).toBe(0);
	expect(activeIndex(0.19, 5)).toBe(0);
	expect(activeIndex(0.2, 5)).toBe(1);
	expect(activeIndex(1, 5)).toBe(4);
	expect(activeIndex(0.5, 0)).toBe(0);
});
