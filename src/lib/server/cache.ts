type Entry = { value?: unknown; has: boolean; expires: number; pending?: Promise<unknown> };

/**
 * A small time-limited cache for server renders. Every visitor's render reaches AniList from the
 * server's one address, so the 30-a-minute budget is shared by all of them. Concurrent misses share
 * one request, and an expired value is still served when AniList refuses the refresh.
 */
export function createCache(max = 500, now = () => Date.now()) {
	const entries = new Map<string, Entry>();

	const remember = (key: string, entry: Entry) => {
		// re-inserting keeps Map order as least-recently-used first
		entries.delete(key);
		entries.set(key, entry);
		while (entries.size > max) entries.delete(entries.keys().next().value!);
	};

	return function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
		const hit = entries.get(key);
		if (hit?.pending) return hit.pending as Promise<T>;
		if (hit?.has && hit.expires > now()) {
			remember(key, hit);
			return Promise.resolve(hit.value as T);
		}
		const pending = load().then(
			(value) => {
				remember(key, { value, has: true, expires: now() + ttlMs });
				return value;
			},
			(error) => {
				if (hit?.has) {
					remember(key, { value: hit.value, has: true, expires: hit.expires });
					return hit.value as T;
				}
				entries.delete(key);
				throw error;
			}
		);
		remember(key, {
			value: hit?.value,
			has: hit?.has ?? false,
			expires: hit?.expires ?? 0,
			pending
		});
		return pending;
	};
}

/** The one cache the server's loads share. */
export const cached = createCache();
