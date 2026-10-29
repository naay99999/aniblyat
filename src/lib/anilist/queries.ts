import { graphql } from '#lib/gql/index.js';
import type { MediaCardFragment, MediaDetailQuery } from '#lib/gql/graphql.js';
import { AniListError, anilistFetch, fetchAllPages, type FetchOptions } from './client';
import { currentSeason, shiftSeason, type Season } from '../season';
import { pickTop10, type RankedMedia } from '../rank';

export type MediaCard = MediaCardFragment;
export type MediaDetail = NonNullable<MediaDetailQuery['Media']>;
export type AiringEntry = { episode: number; airingAt: number; media: MediaCard };

graphql(`
	fragment MediaCard on Media {
		id
		title {
			romaji
			english
		}
		coverImage {
			large
			extraLarge
			color
		}
		bannerImage
		format
		status
		episodes
		averageScore
		popularity
		genres
		startDate {
			year
			month
			day
		}
		nextAiringEpisode {
			episode
			airingAt
		}
		isAdult
	}
`);

const HomeQuery = graphql(`
	query Home($season: MediaSeason!, $year: Int!, $nextSeason: MediaSeason!, $nextYear: Int!) {
		trending: Page(perPage: 12) {
			media(type: ANIME, status: RELEASING, isAdult: false, sort: TRENDING_DESC) {
				...MediaCard
			}
		}
		scored: Page(perPage: 25) {
			media(
				type: ANIME
				season: $season
				seasonYear: $year
				isAdult: false
				sort: [SCORE_DESC, POPULARITY_DESC]
			) {
				...MediaCard
			}
		}
		popular: Page(perPage: 10) {
			media(
				type: ANIME
				season: $season
				seasonYear: $year
				isAdult: false
				sort: POPULARITY_DESC
			) {
				...MediaCard
			}
		}
		next: Page(perPage: 12) {
			media(
				type: ANIME
				season: $nextSeason
				seasonYear: $nextYear
				isAdult: false
				sort: POPULARITY_DESC
			) {
				...MediaCard
			}
		}
	}
`);

const AiringWindowQuery = graphql(`
	query AiringWindow($from: Int!, $to: Int!, $page: Int!) {
		Page(page: $page, perPage: 50) {
			pageInfo {
				hasNextPage
			}
			airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
				episode
				airingAt
				media {
					...MediaCard
				}
			}
		}
	}
`);

const SeasonQuery = graphql(`
	query Season($season: MediaSeason!, $year: Int!, $page: Int!) {
		Page(page: $page, perPage: 50) {
			pageInfo {
				hasNextPage
			}
			media(
				type: ANIME
				season: $season
				seasonYear: $year
				isAdult: false
				sort: POPULARITY_DESC
			) {
				...MediaCard
			}
		}
	}
`);

const MediaByIdsQuery = graphql(`
	query MediaByIds($ids: [Int]!) {
		Page(perPage: 50) {
			pageInfo {
				hasNextPage
			}
			media(id_in: $ids, type: ANIME) {
				...MediaCard
			}
		}
	}
`);

const MediaDetailQuery = graphql(`
	query MediaDetail($id: Int!) {
		Media(id: $id, type: ANIME) {
			...MediaCard
			title {
				native
			}
			description(asHtml: false)
			studios(isMain: true) {
				nodes {
					id
					name
				}
			}
			duration
			source
			season
			seasonYear
			endDate {
				year
				month
				day
			}
			trailer {
				id
				site
			}
			relations {
				edges {
					relationType
					node {
						id
						type
						format
						title {
							romaji
							english
						}
						coverImage {
							large
						}
					}
				}
			}
		}
	}
`);

function compact<T>(list: (T | null | undefined)[] | null | undefined): T[] {
	return (list ?? []).filter((x): x is T => x != null);
}

export async function getHome(
	now: Date,
	opts?: FetchOptions
): Promise<{ trending: MediaCard[]; top10: RankedMedia[]; nextSeason: MediaCard[] }> {
	const current = currentSeason(now);
	const next = shiftSeason(current, 1);
	const data = await anilistFetch(
		HomeQuery,
		{ season: current.season, year: current.year, nextSeason: next.season, nextYear: next.year },
		opts
	);
	return {
		trending: compact(data.trending?.media),
		top10: pickTop10(compact(data.scored?.media), compact(data.popular?.media)),
		nextSeason: compact(data.next?.media)
	};
}

export async function getAiringWindow(
	fromSec: number,
	toSec: number,
	opts?: FetchOptions
): Promise<AiringEntry[]> {
	const all = await fetchAllPages(async (page) => {
		const data = await anilistFetch(AiringWindowQuery, { from: fromSec, to: toSec, page }, opts);
		return {
			items: compact(data.Page?.airingSchedules),
			hasNextPage: data.Page?.pageInfo?.hasNextPage ?? false
		};
	});
	return all.flatMap((s) =>
		s.media && !s.media.isAdult
			? [{ episode: s.episode, airingAt: s.airingAt, media: s.media }]
			: []
	);
}

export async function getSeason(s: Season, opts?: FetchOptions): Promise<MediaCard[]> {
	return fetchAllPages(async (page) => {
		const data = await anilistFetch(SeasonQuery, { season: s.season, year: s.year, page }, opts);
		return {
			items: compact(data.Page?.media),
			hasNextPage: data.Page?.pageInfo?.hasNextPage ?? false
		};
	});
}

export async function getMedia(id: number, opts?: FetchOptions): Promise<MediaDetail | null> {
	try {
		const data = await anilistFetch(MediaDetailQuery, { id }, opts);
		return data.Media ?? null;
	} catch (e) {
		if (e instanceof AniListError && e.status === 404) return null;
		throw e;
	}
}

export async function getMediaByIds(ids: number[], opts?: FetchOptions): Promise<MediaCard[]> {
	const byId = new Map<number, MediaCard>();
	for (let i = 0; i < ids.length; i += 50) {
		const data = await anilistFetch(MediaByIdsQuery, { ids: ids.slice(i, i + 50) }, opts);
		for (const m of compact(data.Page?.media)) byId.set(m.id, m);
	}
	return ids.flatMap((id) => byId.get(id) ?? []);
}
