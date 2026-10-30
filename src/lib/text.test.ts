import { expect, test } from 'vitest';
import { displayTitle, figures, formatLabel, stripHtml } from './text';

test('stripHtml converts breaks and decodes entities', () => {
	expect(stripHtml('It&#x27;s<br>\n<i>fine</i>&nbsp;&amp; ok')).toBe("It's\nfine & ok");
});

test('stripHtml collapses repeated blank lines', () => {
	expect(stripHtml('a<br><br>\n<br>b&#39;&quot;&mdash;')).toBe('a\n\nb\'"—');
});

test('stripHtml of null is empty', () => {
	expect(stripHtml(null)).toBe('');
});

test('displayTitle prefers english then romaji', () => {
	expect(displayTitle({ english: 'Black Clover Season 2', romaji: 'Black Clover 2' })).toBe(
		'Black Clover Season 2'
	);
	expect(displayTitle({ english: null, romaji: 'Mazenchu' })).toBe('Mazenchu');
	expect(displayTitle({})).toBe('');
});

test('figures splits digit runs from the rest', () => {
	expect(figures('in 2 ชม. 5 นาที')).toEqual([
		{ text: 'in ', digits: false },
		{ text: '2', digits: true },
		{ text: ' ชม. ', digits: false },
		{ text: '5', digits: true },
		{ text: ' นาที', digits: false }
	]);
	expect(figures('06:00').map((r) => r.digits)).toEqual([true, false, true]);
	expect(figures('')).toEqual([]);
});

test('formatLabel names every format the same way', () => {
	expect(formatLabel('TV_SHORT')).toBe('TV Short');
	expect(formatLabel('ONA')).toBe('ONA');
	expect(formatLabel('SOME_NEW_KIND')).toBe('SOME NEW KIND');
	expect(formatLabel(null)).toBeNull();
});
