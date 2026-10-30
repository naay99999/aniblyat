export const LIST_KEY = 'aniblyat:list';

export type WatchItem = { id: number; title: string; cover: string | null; addedAt: number };
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export function loadList(storage: Pick<Storage, 'getItem'> | null): WatchItem[] {
	try {
		const raw = storage?.getItem(LIST_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (parsed?.version !== 1 || !Array.isArray(parsed.items)) return [];
		return parsed.items.filter(
			(i: unknown): i is WatchItem =>
				typeof i === 'object' && i !== null && typeof (i as WatchItem).id === 'number'
		);
	} catch {
		return [];
	}
}

export function saveList(storage: Pick<Storage, 'setItem'> | null, items: WatchItem[]): void {
	try {
		storage?.setItem(LIST_KEY, JSON.stringify({ version: 1, items }));
	} catch {
		// private mode or quota: keep the in-memory list
	}
}

export class Watchlist {
	items = $state<WatchItem[]>([]);
	#storage: Storage | null;

	constructor(storage: Storage | null) {
		this.#storage = storage;
		this.items = loadList(storage);
	}

	has(id: number): boolean {
		return this.items.some((i) => i.id === id);
	}

	add(item: Omit<WatchItem, 'addedAt'>): void {
		if (this.has(item.id)) return;
		this.items = [...this.items, { ...item, addedAt: Date.now() }];
		saveList(this.#storage, this.items);
	}

	remove(id: number): void {
		this.items = this.items.filter((i) => i.id !== id);
		saveList(this.#storage, this.items);
	}

	/** Put back an item that was removed, in its old place. */
	restore(item: WatchItem): void {
		if (this.has(item.id)) return;
		this.items = [...this.items, item].sort((a, b) => a.addedAt - b.addedAt);
		saveList(this.#storage, this.items);
	}

	toggle(item: Omit<WatchItem, 'addedAt'>): void {
		if (this.has(item.id)) this.remove(item.id);
		else this.add(item);
	}

	/** Pick up changes made in another tab. */
	reload(): void {
		this.items = loadList(this.#storage);
	}
}

function browserStorage(): Storage | null {
	try {
		return typeof window === 'undefined' ? null : window.localStorage;
	} catch {
		return null;
	}
}

export const watchlist = new Watchlist(browserStorage());

if (typeof window !== 'undefined') {
	window.addEventListener('storage', (e) => {
		if (e.key === LIST_KEY) watchlist.reload();
	});
}

/**
 * Split ids into request-sized buckets by `id % buckets`, so saving or removing one title
 * changes one bucket's query instead of every chunk after it. The bucket count only moves when
 * the list crosses a multiple of `per`.
 */
export function bucketIds(ids: number[], per = 40): number[][] {
	if (ids.length === 0) return [];
	const count = Math.ceil(ids.length / per);
	const buckets: number[][] = Array.from({ length: count }, () => []);
	for (const id of ids) buckets[id % count].push(id);
	return buckets.filter((b) => b.length > 0).map((b) => b.sort((x, y) => x - y));
}
