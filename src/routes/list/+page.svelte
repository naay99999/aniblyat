<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { createQueries, createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { getHome, getMediaByIds, type MediaCard } from '#lib/anilist/queries.js';
	import { airingStatus, formatAirTime } from '#lib/airing.js';
	import { inkOn } from '#lib/color.js';
	import Countdown from '#lib/components/Countdown.svelte';
	import MediaGrid from '#lib/components/MediaGrid.svelte';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import AiringBadge from '#lib/components/AiringBadge.svelte';
	import { animePath, seasonHref } from '#lib/paths.js';
	import { sortMedia } from '#lib/rank.js';
	import { currentSeason } from '#lib/season.js';
	import { toggleSaved } from '#lib/save-feedback.js';
	import { displayTitle } from '#lib/text.js';
	import { bucketIds, watchlist, type WatchItem } from '#lib/watchlist.svelte.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// one query per bucket: saving a title refetches its bucket, not the whole list
	const buckets = $derived(bucketIds(watchlist.items.map((i) => i.id)));
	const queries = createQueries(() => ({
		queries: buckets.map((ids) => ({
			queryKey: ['byIds', ...ids],
			queryFn: () => getMediaByIds(ids)
		}))
	}));
	const query = $derived({
		data: queries.flatMap((q) => q.data ?? []),
		isError: queries.some((q) => q.isError),
		isPending: queries.some((q) => q.isPending),
		refetch: () => queries.forEach((q) => q.isError && q.refetch())
	});
	useAiringInvalidation(
		() => ['byIds'],
		() => query.data
	);

	type Row = { item: WatchItem; media: MediaCard | null };
	const rows = $derived.by<Row[]>(() => {
		const byId = new Map(query.data.map((md) => [md.id, md]));
		const known = sortMedia(
			watchlist.items.flatMap((i) => byId.get(i.id) ?? []),
			'airing',
			clock.now
		);
		const order = new Map(known.map((md, i) => [md.id, i]));
		return watchlist.items
			.map((item) => ({ item, media: byId.get(item.id) ?? null }))
			.sort((a, b) => (order.get(a.item.id) ?? 1e9) - (order.get(b.item.id) ?? 1e9));
	});

	// the soonest episode among saved titles: the one thing worth counting down to
	const nextUp = $derived.by(() => {
		let best: { media: MediaCard; episode: number; airingAt: number } | null = null;
		for (const { media } of rows) {
			if (!media) continue;
			const status = airingStatus(media, clock.now);
			if (status.kind === 'next' && (!best || status.airingAt < best.airingAt)) {
				best = { media, episode: status.episode, airingAt: status.airingAt };
			}
		}
		return best;
	});

	// an empty list starts from what is trending; the home query is usually cached already
	const home = createQuery(() => ({
		queryKey: ['home'],
		queryFn: () => getHome(new Date()),
		initialData: data.home ?? undefined,
		initialDataUpdatedAt: data.fetchedAt,
		enabled: watchlist.items.length === 0
	}));
	const trending = $derived((home.data?.trending ?? []).slice(0, 12));
</script>

<svelte:head><title>{m.list_title()} · aniblyat</title></svelte:head>

<div class="page screen">
	<header class="head">
		<h1 class="display">{m.list_title()}</h1>
		<p class="lead">
			{watchlist.items.length
				? `${m.season_count({ count: String(watchlist.items.length) })} · ${m.list_lead()}`
				: m.list_lead()}
		</p>
	</header>

	{#if watchlist.items.length === 0}
		<div class="empty">
			<p class="statement">{m.list_empty()}</p>
			<a href={seasonHref(currentSeason(new Date(clock.now * 1000)))} class="btn"
				>{m.list_empty_action()}</a
			>
		</div>
		{#if trending.length || home.isPending}
			<section class="start" aria-labelledby="start-title">
				<h2 id="start-title">{m.list_empty_trending()}</h2>
				<MediaGrid items={home.isPending ? undefined : trending} />
			</section>
		{/if}
	{:else}
		{#if nextUp}
			{@const ground = nextUp.media.coverImage?.color ?? null}
			<section
				class="next"
				style:background-color={ground ?? 'var(--color-ink)'}
				style:color={ground ? inkOn(ground) : 'var(--color-bg)'}
				aria-labelledby="next-title"
			>
				{#if nextUp.media.coverImage?.extraLarge ?? nextUp.media.coverImage?.large}
					<a href={animePath(nextUp.media.id)} class="next-cover" tabindex="-1" aria-hidden="true">
						<img
							src={nextUp.media.coverImage?.extraLarge ?? nextUp.media.coverImage?.large}
							alt=""
							width="460"
							height="690"
						/>
					</a>
				{/if}
				<div class="next-words">
					<h2 id="next-title">{m.list_next_title()}</h2>
					<p class="next-name">
						<a href={animePath(nextUp.media.id)} class="link"
							>{displayTitle(nextUp.media.title ?? {})}</a
						>
					</p>
					<p class="next-airs">
						{m.home_hero_airs({
							episode: String(nextUp.episode),
							time: formatAirTime(nextUp.airingAt)
						})}
					</p>
					<Countdown airingAt={nextUp.airingAt} />
				</div>
			</section>
		{/if}
		{#if query.isError}
			<p class="error" role="alert">
				{m.error_title()}
				<button type="button" class="link" onclick={() => query.refetch()}>{m.retry()}</button>
			</p>
		{/if}
		<ul class="rows">
			{#each rows as { item, media } (item.id)}
				{@const title = media ? displayTitle(media.title ?? {}) : item.title}
				{@const cover = media?.coverImage?.extraLarge ?? media?.coverImage?.large ?? item.cover}
				<li animate:flip={{ duration: 400, easing: expoOut }} out:fade={{ duration: 200 }}>
					<a
						href={animePath(item.id)}
						class="thumb"
						tabindex="-1"
						aria-hidden="true"
						style:background-color={media?.coverImage?.color ?? 'var(--color-surface)'}
					>
						{#if cover}<img
								src={cover}
								alt=""
								width="460"
								height="690"
								loading="lazy"
								data-cover
							/>{/if}
					</a>
					<div class="text">
						<a href={animePath(item.id)} class="link name">{title}</a>
						<span class="status">
							{#if media}<AiringBadge {media} showTime />{:else if query.isPending}<span
									class="ghost ghost-line wait"
								></span>{/if}
						</span>
					</div>
					<button
						type="button"
						class="remove"
						onclick={() => toggleSaved({ id: item.id, title, cover })}
					>
						{m.list_remove()}<span class="sr-only"> {title}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.screen {
		padding-block: var(--space-4) var(--section);
		min-height: 70svh;
	}
	.head {
		display: grid;
		gap: 24px;
		padding-top: 24px;
	}
	h1 {
		font-size: clamp(3rem, 1.8rem + 4vw, 6rem);
	}
	.lead {
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.empty {
		display: grid;
		gap: 24px;
		justify-items: start;
		margin-top: 72px;
	}
	.statement {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.start {
		margin-top: var(--space-6);
	}
	h2 {
		margin-bottom: var(--space-3);
		font-size: var(--text-section);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	/* the next episode, in its own cover colour, as the list's headline */
	.next {
		display: grid;
		grid-template-columns: minmax(160px, 240px) minmax(0, 1fr);
		gap: calc(var(--gutter) * 1.5);
		align-items: end;
		margin-top: 64px;
		padding: var(--gutter);
	}
	.next-cover img {
		width: 100%;
		aspect-ratio: 2 / 3;
		object-fit: cover;
	}
	.next-words {
		display: grid;
		gap: 16px;
		max-width: 720px;
	}
	.next h2 {
		margin: 0;
		font-size: var(--text-lead);
		letter-spacing: -0.02em;
	}
	.next-name {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	.next-airs {
		font-weight: 600;
	}
	.error {
		margin-top: 24px;
		color: var(--color-muted);
	}
	.rows {
		margin-top: 40px;
		display: grid;
		gap: 8px;
	}
	li {
		display: grid;
		grid-template-columns: 64px 1fr auto;
		align-items: center;
		gap: 20px;
		padding: 10px 16px 10px 10px;
		background: var(--color-raised);
		transition: background-color var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		li:hover {
			background: #f2f0ec;
		}
	}
	.wait {
		width: 10em;
	}
	.thumb {
		aspect-ratio: 2 / 3;
		overflow: hidden;
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.text {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.name {
		font-weight: 600;
		font-size: var(--text-lead);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	.status {
		font-size: var(--text-small);
	}
	.remove {
		min-height: 44px;
		padding: 0 16px;
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted);
		transition:
			color var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.remove:active {
		transform: scale(0.95);
	}
	@media (hover: hover) and (pointer: fine) {
		.remove:hover {
			color: var(--color-ink);
		}
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (max-width: 900px) {
		h1 {
			font-size: 13vw;
		}
		.next {
			grid-template-columns: 96px 1fr;
			align-items: start;
			--countdown-size: clamp(1.75rem, 8vw, 2.75rem);
		}
		.next-words {
			gap: 10px;
		}
		.next-name {
			font-size: var(--text-lead);
		}
		.next .next-words :global(.countdown) {
			grid-column: 1 / -1;
		}
		.start {
			margin-top: 96px;
		}
	}
	@media (max-width: 720px) {
		li {
			grid-template-columns: 56px 1fr;
		}
		.remove {
			grid-column: 2;
			justify-self: start;
			padding: 0;
		}
	}
</style>
