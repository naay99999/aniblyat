import { describe, expect, test } from 'vitest';
import { LIST_KEY, Watchlist, bucketIds, loadList, saveList } from './watchlist.svelte';

function memoryStorage(initial: Record<string, string> = {}) {
	const data = { ...initial };
	return {
		data,
		getItem: (k: string) => data[k] ?? null,
		setItem: (k: string, v: string) => {
			data[k] = v;
		}
	};
}

const throwing = {
	getItem: () => {
		throw new Error('SecurityError');
	},
	setItem: () => {
		throw new Error('QuotaExceededError');
	}
};

describe('loadList', () => {
	test.each([
		['null storage', null],
		['getItem throwing', throwing],
		['not json', memoryStorage({ [LIST_KEY]: 'not json' })],
		['wrong version', memoryStorage({ [LIST_KEY]: '{"version":2,"items":[]}' })],
		['items not an array', memoryStorage({ [LIST_KEY]: '{"version":1,"items":"x"}' })]
	])('returns [] for %s', (_, storage) => {
		expect(loadList(storage)).toEqual([]);
	});

	test('drops items without a numeric id', () => {
		const storage = memoryStorage({
			[LIST_KEY]: JSON.stringify({
				version: 1,
				items: [{ id: 1, title: 'A', cover: null, addedAt: 5 }, { id: 'x' }, null]
			})
		});
		expect(loadList(storage)).toEqual([{ id: 1, title: 'A', cover: null, addedAt: 5 }]);
	});
});

test('saveList writes the versioned shape under aniblyat:list', () => {
	const storage = memoryStorage();
	saveList(storage, [{ id: 1, title: 'A', cover: null, addedAt: 5 }]);
	expect(LIST_KEY).toBe('aniblyat:list');
	expect(JSON.parse(storage.data[LIST_KEY])).toEqual({
		version: 1,
		items: [{ id: 1, title: 'A', cover: null, addedAt: 5 }]
	});
});

describe('Watchlist', () => {
	test('add, has, remove and persist', () => {
		const storage = memoryStorage();
		const list = new Watchlist(storage);
		list.add({ id: 1, title: 'A', cover: null });
		list.add({ id: 1, title: 'A', cover: null });
		list.add({ id: 2, title: 'B', cover: 'b.jpg' });
		expect(list.has(1)).toBe(true);
		expect(list.items.map((i) => i.id)).toEqual([1, 2]);
		list.remove(1);
		expect(list.has(1)).toBe(false);
		expect(JSON.parse(storage.data[LIST_KEY]).items.map((i: { id: number }) => i.id)).toEqual([2]);
	});

	test('toggle adds then removes', () => {
		const list = new Watchlist(memoryStorage());
		list.toggle({ id: 3, title: 'C', cover: null });
		expect(list.has(3)).toBe(true);
		list.toggle({ id: 3, title: 'C', cover: null });
		expect(list.has(3)).toBe(false);
	});

	test('restore puts a removed item back in its old place', () => {
		const storage = memoryStorage({
			[LIST_KEY]: JSON.stringify({
				version: 1,
				items: [
					{ id: 1, title: 'A', cover: null, addedAt: 1 },
					{ id: 2, title: 'B', cover: null, addedAt: 2 },
					{ id: 3, title: 'C', cover: null, addedAt: 3 }
				]
			})
		});
		const list = new Watchlist(storage);
		const removed = list.items[1];
		list.remove(2);
		list.restore(removed);
		list.restore(removed);
		expect(list.items.map((i) => i.id)).toEqual([1, 2, 3]);
		expect(JSON.parse(storage.data[LIST_KEY]).items).toHaveLength(3);
	});

	test('reads existing items on construction', () => {
		const storage = memoryStorage({
			[LIST_KEY]: JSON.stringify({
				version: 1,
				items: [{ id: 9, title: 'Z', cover: null, addedAt: 1 }]
			})
		});
		expect(new Watchlist(storage).has(9)).toBe(true);
	});

	test('storage that throws does not break add', () => {
		const list = new Watchlist(throwing);
		expect(() => list.add({ id: 1, title: 'A', cover: null })).not.toThrow();
		expect(list.has(1)).toBe(true);
	});
});

describe('bucketIds', () => {
	test('one bucket for a short list', () => {
		expect(bucketIds([5, 1, 3])).toEqual([[1, 3, 5]]);
	});

	test('an added id changes only its own bucket', () => {
		const ids = Array.from({ length: 100 }, (_, i) => i * 7 + 1);
		const before = bucketIds(ids);
		const after = bucketIds([...ids, 9999]);
		const changed = after.filter((b) => !before.some((o) => o.join() === b.join()));
		expect(before.length).toBe(after.length);
		expect(changed).toHaveLength(1);
		expect(changed[0]).toContain(9999);
	});

	test('nothing in, nothing out', () => {
		expect(bucketIds([])).toEqual([]);
	});
});
