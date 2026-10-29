import { QueryClient } from '@tanstack/svelte-query';
import { clock } from '../clock.svelte';

const THIRTY_MINUTES = 30 * 60 * 1000;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: THIRTY_MINUTES,
			refetchInterval: THIRTY_MINUTES,
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
