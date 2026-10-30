<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { reveal } from '../actions/reveal';
	import { animePath, seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	// `failed`: the season query errored, so the figure will never arrive
	let {
		season,
		items,
		failed = false
	}: { season: Season; items: MediaCard[] | undefined; failed?: boolean } = $props();

	const count = $derived(items?.length);
	// the wall shows the season's most followed titles; the link carries the rest
	const wall = $derived((items ?? []).filter((i) => i.coverImage?.large).slice(0, 40));
</script>

<section class="count page" aria-labelledby="count-title">
	<div class="words">
		<h2 id="count-title" class="claim" use:reveal>{m.home_count_title()}</h2>
		<p class="figure display tabular" use:reveal={1}>
			{#if count == null && failed}
				<span class="unavailable">{m.home_count_unavailable()}</span>
			{:else if count == null}
				<span class="pending" aria-hidden="true"></span>
			{:else}
				<a href={seasonHref(season)}>{count}</a><sup>{m.home_count_unit()}</sup>
			{/if}
		</p>
		<p class="caption" use:reveal={2}>
			{m.home_count_caption({ season: seasonLabel(season) })}
		</p>
		{#if count}
			<p use:reveal={3}>
				<a href={seasonHref(season)} class="btn">{m.home_count_more({ count: String(count) })}</a>
			</p>
		{/if}
	</div>

	<ul class="wall" aria-hidden="true">
		{#each wall as media, i (media.id)}
			<li use:reveal={i % 8}>
				<a href={animePath(media.id)} tabindex="-1" title={displayTitle(media.title ?? {})}>
					<img
						src={media.coverImage?.extraLarge ?? media.coverImage?.large}
						alt=""
						width="460"
						height="690"
						loading="lazy"
					/>
				</a>
			</li>
		{:else}
			{#each { length: 24 }, i (i)}
				<li class="blank"></li>
			{/each}
		{/each}
	</ul>
</section>

<style>
	.count {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: end;
		padding-block: calc(var(--section) * 1.25);
		background: var(--color-ink);
		color: var(--color-bg);
		/* the wall's blank tone: ink lifted a little toward white */
		--tile: color-mix(in srgb, var(--color-ink) 88%, white);
	}
	/* mirrored against the Top 10 split that follows: pictures left, figure right */
	.words {
		grid-column: 9 / -1;
		grid-row: 1;
		display: grid;
		gap: 24px;
		justify-items: start;
	}
	.claim {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.figure {
		font-size: clamp(140px, 13vw, 220px);
		/* the glyph box spills ~0.2em above a 0.8 line box; keep it off the heading */
		margin-top: 0.12em;
		line-height: 0.8;
		min-height: 0.8em;
	}
	/* while the season loads: a block the size of the figure, in the wall's blank tone */
	.pending {
		display: block;
		width: 1.8em;
		height: 0.72em;
		background: var(--tile);
	}
	/* the season query failed: say so once, at reading size, instead of an endless pulse */
	.unavailable {
		display: block;
		max-width: 16ch;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	@media (prefers-reduced-motion: no-preference) {
		.pending {
			animation: wait 1.4s ease-in-out infinite alternate;
		}
	}
	@keyframes wait {
		to {
			opacity: 0.5;
		}
	}
	.figure a {
		transition: color var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.figure a:hover {
			color: var(--color-accent-200);
		}
	}
	sup {
		font-size: 0.2em;
		letter-spacing: -0.02em;
		vertical-align: top;
		margin-left: 0.15em;
		position: relative;
		top: 0.15em;
	}
	.caption {
		max-width: 36ch;
		font-size: var(--text-body);
	}
	.wall {
		grid-column: 1 / 9;
		grid-row: 1;
		display: grid;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		gap: 6px;
		list-style: none;
	}
	.wall a,
	.blank {
		display: block;
		aspect-ratio: 2 / 3;
		overflow: hidden;
		background: var(--tile);
	}
	.wall img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition:
			transform var(--t-move) var(--ease-out),
			opacity var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.wall:hover img {
			opacity: 0.55;
		}
		.wall a:hover img {
			opacity: 1;
			transform: scale(1.06);
		}
	}
	@media (max-width: 900px) {
		.count {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 48px;
		}
		.words,
		.wall {
			grid-column: 1;
			grid-row: auto;
		}
		.figure {
			font-size: 40vw;
		}
		.wall {
			grid-template-columns: repeat(6, minmax(0, 1fr));
			gap: 4px;
		}
		.wall li:nth-child(n + 25) {
			display: none;
		}
	}
</style>
