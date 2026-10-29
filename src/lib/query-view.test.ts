import { expect, test } from 'vitest';
import { queryView } from './query-view';

test('pending before any data', () => {
	expect(queryView({ isPending: true, isError: false, data: undefined })).toBe('pending');
});

test('error only when there is nothing to show', () => {
	expect(queryView({ isPending: false, isError: true, data: undefined })).toBe('error');
});

test('a failed background refetch keeps showing the loaded data', () => {
	expect(queryView({ isPending: false, isError: true, data: [1] })).toBe('stale');
});

test('data', () => {
	expect(queryView({ isPending: false, isError: false, data: [1] })).toBe('data');
});
