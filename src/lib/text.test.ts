import { expect, test } from 'vitest';
import { displayTitle, stripHtml } from './text';

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
