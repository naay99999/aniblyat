<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { getSeason } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import MediaGrid from '#lib/components/MediaGrid.svelte';
	import QueryState from '#lib/components/QueryState.svelte';
	import { reveal } from '#lib/actions/reveal.js';
	import { animePath, seasonHref } from '#lib/paths.js';
	import { groupByFormat, sortMedia, type SortKey } from '#lib/rank.js';
	import { currentSeason, sameSeason, seasonLabel, shiftSeason } from '#lib/season.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const season = $derived(data.season);
	const isCurrent = $derived(sameSeason(season, currentSeason(new Date(clock.now * 1000))));
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
		queryFn: () => getSeason(season),
		initialData: data.initial?.media,
		initialDataUpdatedAt: data.initial?.fetchedAt
	}));
	useAiringInvalidation(
		() => ['season', season.year, season.season],
		() => query.data
	);

	const groups = $derived(groupByFormat(sortMedia(query.data ?? [], sort, clock.now)));
	// the season's face: its most followed titles, whatever the list below is sorted by
	const faces = $derived(
		sortMedia(query.data ?? [], 'popularity', clock.now)
			.filter((md) => md.coverImage?.large)
			.slice(0, 8)
	);
</script>

<svelte:head><title>{seasonLabel(season)} · aniblyat</title></svelte:head>

{#snippet cards()}
	<!-- the grid's own shape while AniList answers -->
	<ul class="ghosts" role="status" aria-label={m.loading()}>
		{#each { length: 12 }, i (i)}<li></li>{/each}
	</ul>
{/snippet}

<div class="page screen">
	<header class="head">
		<div class="words">
			<h1 class="display">{seasonLabel(season)}</h1>
			<p class="lead">
				{query.data
					? m.season_lead({ count: String(query.data.length), season: seasonLabel(season) })
					: m.season_lead_pending({ season: seasonLabel(season) })}
			</p>
			<nav class="step" aria-label={seasonLabel(season)}>
				<a href={seasonHref(shiftSeason(season, -1))} class="link"
					>← {seasonLabel(shiftSeason(season, -1))}<span class="sr-only">{m.season_prev()}</span></a
				>
				<a href={seasonHref(shiftSeason(season, 1))} class="link"
					>{seasonLabel(shiftSeason(season, 1))} →<span class="sr-only">{m.season_next()}</span></a
				>
			</nav>
		</div>
		<ul class="faces" aria-hidden="true">
			{#each faces as media, i (media.id)}
				<li use:reveal={i}>
					<a href={animePath(media.id)} tabindex="-1">
						<img src={media.coverImage?.large} alt="" width="230" height="345" />
					</a>
				</li>
			{:else}
				{#each { length: 8 }, i (i)}<li class="blank"></li>{/each}
			{/each}
		</ul>
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

	<QueryState {query} pending={cards}>
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
	.head {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: end;
		padding-top: 24px;
	}
	.words {
		grid-column: 1 / 7;
		display: grid;
		gap: 24px;
		align-content: end;
		padding-bottom: 8px;
	}
	h1 {
		font-size: clamp(4rem, 2rem + 6vw, 9rem);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.lead {
		max-width: 30ch;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	.step {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 24px;
		font-weight: 600;
	}
	.step a {
		text-decoration-color: currentColor;
	}
	.faces {
		grid-column: 7 / -1;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 6px;
		list-style: none;
	}
	.faces a,
	.faces .blank {
		display: block;
		aspect-ratio: 2 / 3;
		overflow: hidden;
		background: var(--color-surface);
	}
	.faces img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 500ms var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.faces a:hover img {
			transform: scale(1.05);
		}
	}
	.ghosts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 32px 20px;
		list-style: none;
	}
	.ghosts li {
		aspect-ratio: 2 / 3;
		background: var(--color-surface);
	}
	@media (prefers-reduced-motion: no-preference) {
		.ghosts li {
			animation: wait 1.4s ease-in-out infinite alternate;
		}
	}
	@keyframes wait {
		to {
			opacity: 0.5;
		}
	}
	@media (max-width: 900px) {
		.head {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 32px;
		}
		.words,
		.faces {
			grid-column: 1;
		}
		h1 {
			font-size: 15vw;
		}
		.ghosts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.toolbar {
		position: sticky;
		top: var(--bar-shown, 0px);
		transition: top 360ms var(--ease-out);
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
	/* on a phone the chips wrap to two rows: too much to keep pinned over the grid */
	@media (max-width: 720px) {
		.toolbar {
			position: static;
		}
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
