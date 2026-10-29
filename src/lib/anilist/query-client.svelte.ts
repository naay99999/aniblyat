import { QueryClient } from '@tanstack/svelte-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { removeOldestQuery } from '@tanstack/svelte-query-persist-client';
import { clock } from '../clock.svelte';
import { currentSeason } from '../season';

const THIRTY_MINUTES = 30 * 60 * 1000;
export const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: THIRTY_MINUTES,
			refetchInterval: THIRTY_MINUTES,
			// kept long enough to be persisted and restored on the next visit
			gcTime: CACHE_MAX_AGE,
			// retries for 429 live in anilistFetch
			retry: false
		}
	}
});

/** Smallest `airingAt` (or `nextAiringEpisode.airingAt`) anywhere inside a query result. */
export function earliestAiringAt(data: unknown): number | null {
	let min: number | null = null;
	const visit = (value: unknown) => {
		if (Array.isArray(value)) {
			value.forEach(visit);
		} else if (value && typeof value === 'object') {
			for (const [key, child] of Object.entries(value)) {
				if (key === 'airingAt' && typeof child === 'number') {
					min = min == null ? child : Math.min(min, child);
				} else {
					visit(child);
				}
			}
		}
	};
	visit(data);
	return min;
}

export function shouldInvalidate(
	earliest: number | null,
	nowSec: number,
	lastInvalidatedFor: number | null
): boolean {
	return earliest != null && earliest <= nowSec && earliest !== lastInvalidatedFor;
}

/** Refetch a query as soon as an episode it shows has aired, so countdowns move to the next one. */
export function useAiringInvalidation(queryKey: () => unknown[], getData: () => unknown) {
	let lastInvalidatedFor: number | null = null;
	$effect(() => {
		const earliest = earliestAiringAt(getData());
		if (shouldInvalidate(earliest, clock.now, lastInvalidatedFor)) {
			lastInvalidatedFor = earliest;
			queryClient.invalidateQueries({ queryKey: queryKey() });
		}
	});
}

function browserStorage(): Storage | null {
	try {
		return typeof window === 'undefined' ? null : window.localStorage;
	} catch {
		return null;
	}
}

/** Query cache saved in localStorage: reloads render at once and spend fewer of AniList's 30 requests a minute. */
export const persister = createSyncStoragePersister({
	storage: browserStorage(),
	key: 'aniblyat:cache',
	throttleTime: 2000,
	// on quota errors drop the oldest cached query instead of failing
	retry: removeOldestQuery
});

/** Persist only small, reused queries so the cache cannot crowd the watchlist out of localStorage. */
export function shouldPersist(queryKey: readonly unknown[], now: Date): boolean {
	const [kind, year, season] = queryKey;
	if (kind === 'home' || kind === 'byIds') return true;
	if (kind === 'season') {
		const current = currentSeason(now);
		return year === current.year && season === current.season;
	}
	return false;
}
