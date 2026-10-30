<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { createQuery, keepPreviousData, useQueryClient } from '@tanstack/svelte-query';
	import { getAiringWindow, getHome, getSeason, type MediaCard } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import QueryState from '#lib/components/QueryState.svelte';
	import AiringLineup from '#lib/home/AiringLineup.svelte';
	import Hero from '#lib/home/Hero.svelte';
	import NextSeason from '#lib/home/NextSeason.svelte';
	import SeasonCount from '#lib/home/SeasonCount.svelte';
	import TopShowcase from '#lib/home/TopShowcase.svelte';
	import { pickHero } from '#lib/hero-pick.js';
	import { currentSeason, shiftSeason } from '#lib/season.js';
	import { watchlist } from '#lib/watchlist.svelte.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// follows the shared clock, so a tab left open across a season boundary moves on
	const season = $derived(currentSeason(new Date(clock.now * 1000)));
	const next = $derived(shiftSeason(season, 1));
	const hour = $derived(Math.floor(clock.now / 3600));

	const home = createQuery(() => ({
		queryKey: ['home'],
		queryFn: () => getHome(new Date()),
		initialData: data.initial?.home,
		enabled: browser,
		initialDataUpdatedAt: data.initial?.fetchedAt
	}));
	const airing = createQuery(() => ({
		queryKey: ['airing', hour],
		queryFn: () => getAiringWindow(hour * 3600, hour * 3600 + 86400 + 3600),
		initialData: data.initial?.hour === hour ? data.initial.airing : undefined,
		// the hour's key changes every hour: keep the last lineup on screen while the next loads
		placeholderData: keepPreviousData,
		enabled: browser,
		initialDataUpdatedAt: data.initial?.fetchedAt
	}));
	const seasonList = createQuery(() => ({
		queryKey: ['season', season.year, season.season],
		queryFn: () => getSeason(season),
		enabled: browser
	}));

	useAiringInvalidation(
		() => ['home'],
		() => home.data
	);

	// the saved list lives in localStorage: reading it before mount would not match the server render
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const queryClient = useQueryClient();

	// the server render and the first client render pick by popularity; after mount the visitor's
	// own list takes over. Only airing data we already hold is used, nothing is fetched for it.
	const hero = $derived.by(() => {
		const saved = mounted ? watchlist.items.map((i) => i.id) : [];
		const known: MediaCard[] = saved.length
			? [
					...(seasonList.data ?? []),
					...(home.data?.trending ?? []),
					...queryClient
						.getQueriesData<MediaCard[]>({ queryKey: ['byIds'] })
						.flatMap(([, cards]) => cards ?? [])
				]
			: [];
		return pickHero({
			savedIds: saved,
			known,
			season: seasonList.data,
			trending: home.data?.trending,
			nowSec: clock.now
		});
	});
</script>

<Hero {season} items={hero.items} reason={hero.reason} />

{#snippet lineupWaiting()}<AiringLineup entries={undefined} />{/snippet}
{#snippet homeWaiting()}
	<TopShowcase items={undefined} />
	<NextSeason season={next} items={undefined} />
{/snippet}

<QueryState query={airing} inset pending={lineupWaiting}>
	<AiringLineup entries={airing.data ?? []} />
</QueryState>

<SeasonCount {season} items={seasonList.data} failed={seasonList.isError} />

<QueryState query={home} inset pending={homeWaiting}>
	<TopShowcase items={home.data?.top10 ?? []} />
	<NextSeason season={next} items={home.data?.nextSeason ?? []} />
</QueryState>
