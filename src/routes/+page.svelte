<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { getAiringWindow, getHome, getSeason } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import QueryState from '#lib/components/QueryState.svelte';
	import AiringLineup from '#lib/home/AiringLineup.svelte';
	import Hero from '#lib/home/Hero.svelte';
	import NextSeason from '#lib/home/NextSeason.svelte';
	import SeasonCount from '#lib/home/SeasonCount.svelte';
	import TopShowcase from '#lib/home/TopShowcase.svelte';
	import { currentSeason, shiftSeason } from '#lib/season.js';

	const season = currentSeason(new Date());
	const next = shiftSeason(season, 1);
	const hour = $derived(Math.floor(clock.now / 3600));

	const home = createQuery(() => ({ queryKey: ['home'], queryFn: () => getHome(new Date()) }));
	const airing = createQuery(() => ({
		queryKey: ['airing', hour],
		queryFn: () => getAiringWindow(hour * 3600, hour * 3600 + 86400 + 3600)
	}));
	const seasonList = createQuery(() => ({
		queryKey: ['season', season.year, season.season],
		queryFn: () => getSeason(season)
	}));

	useAiringInvalidation(
		() => ['home'],
		() => home.data
	);
</script>

<Hero {season} items={home.data?.trending} />

<QueryState query={airing}>
	<AiringLineup entries={airing.data ?? []} />
</QueryState>

<SeasonCount {season} count={seasonList.data?.length} />

<QueryState query={home}>
	<TopShowcase items={home.data?.top10 ?? []} />
	<NextSeason season={next} items={home.data?.nextSeason ?? []} />
</QueryState>
