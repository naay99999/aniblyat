<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { reveal } from '../actions/reveal';
	import MediaGrid from '../components/MediaGrid.svelte';
	import { animePath, seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	// no items yet: the trio and the grid hold their shape with blanks
	let { season, items }: { season: Season; items: MediaCard[] | undefined } = $props();

	const withArt = $derived(
		(items ?? []).filter((i) => i.coverImage?.extraLarge ?? i.coverImage?.large)
	);
	const trio = $derived(
		withArt.length >= 3 ? [withArt[1], withArt[0], withArt[2]] : withArt.slice(0, 3)
	);
	const rest = $derived((items ?? []).filter((i) => !trio.includes(i)));
</script>

<section class="next page capped" aria-labelledby="next-title">
	<div class="stage chapter">
		<div class="intro">
			<h2 id="next-title" class="head" use:reveal>
				{m.home_next_title({ season: seasonLabel(season) })}
			</h2>
			<p use:reveal={1}>{m.home_next_lead()}</p>
		</div>
		<div class="trio chapter-matter">
			{#if !items}
				{#each [false, true, false] as centre, i (i)}
					<span class="pic ghost" class:centre aria-hidden="true"></span>
				{/each}
			{/if}
			{#each trio as media, i (media.id)}
				<a
					href={animePath(media.id)}
					class="pic"
					class:centre={i === 1}
					use:reveal={i === 1 ? 0 : 2}
				>
					<span class="frame">
						<img
							src={media.coverImage?.extraLarge ?? media.coverImage?.large}
							alt=""
							loading="lazy"
							width="460"
							height="690"
						/>
					</span>
					<span class="caption">{displayTitle(media.title ?? {})}</span>
				</a>
			{/each}
		</div>
	</div>

	<div class="more">
		{#if !items}<MediaGrid items={undefined} ghosts={6} />{:else if rest.length}<MediaGrid
				items={rest}
			/>{/if}
		<p class="action">
			<a href={seasonHref(season)} class="btn btn-ink"
				>{m.home_next_action({ season: seasonLabel(season) })}</a
			>
		</p>
	</div>
</section>

<style>
	/* the Top 10 above already ends with a section's worth of space */
	/* the head at the left, three of the season's covers standing at the right */
	.intro {
		grid-column: 1 / 5;
		align-self: start;
		display: grid;
		gap: var(--space-2);
	}
	.head {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.045em;
		line-height: 1;
		text-wrap: balance;
	}
	.intro p {
		max-width: 36ch;
		color: var(--color-muted);
	}
	.trio {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.pic {
		flex: 0 0 auto;
		display: grid;
		gap: var(--space-1);
		align-content: start;
		width: calc((100% - 20px) * 0.28);
		margin-top: 48px;
	}
	.pic.centre {
		width: calc((100% - 20px) * 0.44);
		margin-top: 0;
	}
	.frame,
	.pic.ghost {
		display: block;
		aspect-ratio: 2 / 3;
		overflow: hidden;
	}
	.pic.centre .frame,
	.pic.centre.ghost {
		aspect-ratio: 4 / 5;
	}
	.caption {
		font-size: var(--text-small);
		font-weight: 600;
		line-height: 1.45;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.pic img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--t-move) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.pic:hover img {
			transform: scale(1.04);
		}
	}
	.more {
		display: grid;
		gap: var(--space-5);
		padding-block: var(--space-6) var(--section);
	}
	/* on the home page the posters get more room: five to a row at most */
	.more :global(.grid) {
		--cols: 5;
	}
	@media (max-width: 900px) {
		.intro {
			grid-column: 1;
		}
	}
	/* on a phone the rest is a row to swipe through, not a long column */
	@media (max-width: 720px) {
		.more :global(.grid) {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: 42vw;
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}
		.more :global(.grid > li) {
			scroll-snap-align: start;
		}
	}
	@media (max-width: 900px) {
		.trio {
			gap: 8px;
		}
		.pic {
			margin-top: 32px;
		}
	}
</style>
