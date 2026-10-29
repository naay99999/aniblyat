import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

export const ANILIST_URL = 'https://graphql.anilist.co';

export class AniListError extends Error {
	status: number;
	retryable: boolean;

	constructor(message: string, status: number, retryable: boolean) {
		super(message);
		this.name = 'AniListError';
		this.status = status;
		this.retryable = retryable;
	}
}

export type FetchOptions = {
	fetch?: typeof fetch;
	sleep?: (ms: number) => Promise<void>;
	maxRetries?: number;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type GraphQLResponse<T> = {
	data?: T | null;
	errors?: { message: string; status?: number }[];
};

export async function anilistFetch<TData, TVars>(
	doc: TypedDocumentNode<TData, TVars> | string,
	variables?: TVars,
	opts: FetchOptions = {}
): Promise<TData> {
	const doFetch = opts.fetch ?? fetch;
	const sleep = opts.sleep ?? defaultSleep;
	const maxRetries = opts.maxRetries ?? 2;
	const query = typeof doc === 'string' ? doc : print(doc);
	const body = JSON.stringify({ query, variables: variables ?? {} });

	for (let attempt = 0; ; attempt++) {
		const res = await doFetch(ANILIST_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body
		});

		if (res.status === 429) {
			if (attempt >= maxRetries) {
				throw new AniListError('AniList rate limit reached', 429, true);
			}
			const retryAfter = Number(res.headers.get('Retry-After'));
			await sleep((Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60) * 1000);
			continue;
		}

		const json = (await res.json().catch(() => ({}))) as GraphQLResponse<TData>;
		if (json.errors?.length || !res.ok || json.data == null) {
			const first = json.errors?.[0];
			const status = first?.status ?? res.status;
			throw new AniListError(first?.message ?? `AniList error ${status}`, status, status >= 500);
		}
		return json.data;
	}
}

export async function fetchAllPages<T>(
	fetchPage: (page: number) => Promise<{ items: T[]; hasNextPage: boolean }>,
	maxPages = 20
): Promise<T[]> {
	const all: T[] = [];
	for (let page = 1; page <= maxPages; page++) {
		const { items, hasNextPage } = await fetchPage(page);
		all.push(...items);
		if (!hasNextPage) break;
	}
	return all;
}
