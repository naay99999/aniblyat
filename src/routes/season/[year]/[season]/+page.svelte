<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { getSeason } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import MediaGrid from '#lib/components/MediaGrid.svelte';
	import QueryState from '#lib/components/QueryState.svelte';
	import { seasonHref } from '#lib/paths.js';
	import { groupByFormat, sortMedia, type SortKey } from '#lib/rank.js';
	import { currentSeason, sameSeason, seasonLabel, shiftSeason } from '#lib/season.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const season = $derived(data.season);
	const isCurrent = $derived(sameSeason(season, currentSeason(new Date())));
	const SORTS: SortKey[] = ['airing', 'popularity', 'score', 'title'];
	const sortLabels: Record<SortKey, () => string> = {
		airing: m.sort_airing,
		popularity: m.sort_popularity,
		score: m.sort_score,
		title: m.sort_title
	};
	const sort = $derived.by<SortKey>(() => {
		const q = page.url.searchParams.get('sort') as SortKey | null;
		return q && SORTS.includes(q) ? q : isCurrent ? 'airing' : 'popularity';
	});

	const query = createQuery(() => ({
		queryKey: ['season', season.year, season.season],
		queryFn: () => getSeason(season)
	}));
	useAiringInvalidation(
		() => ['season', season.year, season.season],
		() => query.data
	);

	const groups = $derived(groupByFormat(sortMedia(query.data ?? [], sort, clock.now)));
</script>

<svelte:head><title>{seasonLabel(season)} · aniblyat</title></svelte:head>

<div class="page screen">
	<header class="title-row">
		<div>
			<h1>{seasonLabel(season)}</h1>
			{#if query.data}<p class="sub">{m.season_count({ count: String(query.data.length) })}</p>{/if}
		</div>
		<nav class="step" aria-label={seasonLabel(season)}>
			<a href={seasonHref(shiftSeason(season, -1))} class="link"
				>← {seasonLabel(shiftSeason(season, -1))}<span class="sr-only">{m.season_prev()}</span></a
			>
			<a href={seasonHref(shiftSeason(season, 1))} class="link"
				>{seasonLabel(shiftSeason(season, 1))} →<span class="sr-only">{m.season_next()}</span></a
			>
		</nav>
	</header>

	<div class="toolbar">
		{#if groups.length > 1}
			<ul class="jump">
				{#each groups as group (group.group)}
					<li>
						<a href="#{group.group}" class="chip"
							>{group.label} <span class="tabular">{group.items.length}</span></a
						>
					</li>
				{/each}
			</ul>
		{/if}
		<form
			class="sort"
			method="GET"
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			data-sveltekit-keepfocus
		>
			<label>
				<span>{m.sort_label()}</span>
				<select name="sort" value={sort} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
					{#each SORTS as key (key)}
						<option value={key}>{sortLabels[key]()}</option>
					{/each}
				</select>
			</label>
			<noscript><button type="submit" class="btn btn-ink">{m.sort_label()}</button></noscript>
		</form>
	</div>

	<QueryState {query}>
		{#if groups.length === 0}
			<p class="empty">{m.season_empty()}</p>
		{:else}
			{#each groups as group (group.group)}
				<section id={group.group} class="group" aria-labelledby="{group.group}-title">
					<h2 id="{group.group}-title">
						{group.label} <span class="count tabular">{group.items.length}</span>
					</h2>
					<MediaGrid items={group.items} />
				</section>
			{/each}
		{/if}
	</QueryState>
</div>

<style>
	.screen {
		padding-block: 32px 120px;
	}
	.title-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: end;
		gap: 16px 32px;
	}
	h1 {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.sub {
		margin-top: 8px;
		color: var(--color-muted);
	}
	.step {
		display: flex;
		gap: 24px;
		font-weight: 600;
	}
	.toolbar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 12px 24px;
		margin-block: 24px 40px;
		padding-block: 12px;
		background: var(--color-bg);
	}
	.jump {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		padding: 0 14px;
		border-radius: 999px;
		background: var(--color-accent-50);
		color: #134452;
		font-size: var(--text-small);
		font-weight: 600;
		transition: background-color var(--t-hover) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.chip:hover {
			background: var(--color-accent-100);
		}
	}
	.sort label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: var(--text-small);
		font-weight: 600;
	}
	select {
		min-height: 36px;
		padding-block: 0;
		border: 0;
		background-color: var(--color-raised);
		font-size: var(--text-small);
	}
	.group {
		scroll-margin-top: 80px;
	}
	.group + .group {
		margin-top: 96px;
	}
	h2 {
		margin-bottom: 24px;
		font-size: var(--text-lead);
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.count {
		color: var(--color-muted);
		font-weight: 400;
	}
	.empty {
		padding-block: 48px;
		font-size: var(--text-lead);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
