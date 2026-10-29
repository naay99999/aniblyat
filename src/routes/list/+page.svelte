<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { getMediaByIds, type MediaCard } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import AiringBadge from '#lib/components/AiringBadge.svelte';
	import { animePath, seasonHref } from '#lib/paths.js';
	import { sortMedia } from '#lib/rank.js';
	import { currentSeason } from '#lib/season.js';
	import { displayTitle } from '#lib/text.js';
	import { watchlist, type WatchItem } from '#lib/watchlist.svelte.js';

	const ids = $derived(watchlist.items.map((i) => i.id).sort((a, b) => a - b));
	const query = createQuery(() => ({
		queryKey: ['byIds', ...ids],
		queryFn: () => getMediaByIds(ids),
		enabled: ids.length > 0
	}));
	useAiringInvalidation(
		() => ['byIds', ...ids],
		() => query.data
	);

	type Row = { item: WatchItem; media: MediaCard | null };
	const rows = $derived.by<Row[]>(() => {
		const byId = new Map((query.data ?? []).map((md) => [md.id, md]));
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
</script>

<svelte:head><title>{m.list_title()} · aniblyat</title></svelte:head>

<div class="page screen">
	<header class="title-row">
		<h1>{m.list_title()}</h1>
		<p class="sub">
			{watchlist.items.length
				? `${m.season_count({ count: String(watchlist.items.length) })} · ${m.list_lead()}`
				: m.list_lead()}
		</p>
	</header>

	{#if watchlist.items.length === 0}
		<div class="empty">
			<p>{m.list_empty()}</p>
			<a href={seasonHref(currentSeason(new Date()))} class="btn">{m.list_empty_action()}</a>
		</div>
	{:else}
		{#if query.isError}
			<p class="error" role="alert">
				{m.error_title()}
				<button type="button" class="link" onclick={() => query.refetch()}>{m.retry()}</button>
			</p>
		{/if}
		<ul class="rows">
			{#each rows as { item, media } (item.id)}
				{@const title = media ? displayTitle(media.title ?? {}) : item.title}
				{@const cover = media?.coverImage?.large ?? item.cover}
				<li animate:flip={{ duration: 300 }} out:fade={{ duration: 160 }}>
					<a
						href={animePath(item.id)}
						class="thumb"
						tabindex="-1"
						aria-hidden="true"
						style:background-color={media?.coverImage?.color ?? 'var(--color-surface)'}
					>
						{#if cover}<img src={cover} alt="" width="230" height="345" loading="lazy" />{/if}
					</a>
					<div class="text">
						<a href={animePath(item.id)} class="link name">{title}</a>
						<span class="status">
							{#if media}<AiringBadge {media} showTime />{:else if query.isPending}…{/if}
						</span>
					</div>
					<button type="button" class="remove" onclick={() => watchlist.remove(item.id)}>
						{m.list_remove()}<span class="sr-only"> {title}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.screen {
		padding-block: 32px 120px;
		min-height: 70svh;
	}
	h1 {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.sub {
		margin-top: 8px;
		color: var(--color-muted);
	}
	.empty {
		display: grid;
		gap: 20px;
		justify-items: start;
		margin-top: 64px;
		font-size: var(--text-lead);
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
		transition: background-color var(--t-hover) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		li:hover {
			background: #f2f0ec;
		}
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
			color var(--t-hover) ease,
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
