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

<section class="next" aria-labelledby="next-title">
	<div class="stage">
		<div class="intro page">
			<h2 id="next-title" class="head" use:reveal>
				{m.home_next_title({ season: seasonLabel(season) })}
			</h2>
			<p use:reveal={1}>{m.home_next_lead()}</p>
		</div>
		<div class="trio">
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
					<img
						src={media.coverImage?.extraLarge ?? media.coverImage?.large}
						alt={displayTitle(media.title ?? {})}
						loading="lazy"
						width="460"
						height="690"
					/>
				</a>
			{/each}
		</div>
	</div>

	<div class="more page">
		{#if !items}<MediaGrid items={undefined} ghosts={6} />{:else if rest.length}<MediaGrid
				items={rest}
			/>{/if}
		<p class="action">
			<a href={seasonHref(season)} class="btn"
				>{m.home_next_action({ season: seasonLabel(season) })}</a
			>
		</p>
	</div>
</section>

<style>
	.stage {
		display: grid;
		gap: var(--space-5);
		padding-top: var(--section);
	}
	.intro {
		text-align: center;
		display: grid;
		gap: var(--space-2);
		justify-items: center;
	}
	.head {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
		max-width: 20ch;
	}
	.trio {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 10px;
	}
	.pic {
		flex: 0 0 auto;
		width: min(260px, 20vw);
		aspect-ratio: 2 / 3;
		margin-top: 48px;
		overflow: hidden;
	}
	.pic.centre {
		width: min(380px, 28vw);
		aspect-ratio: 4 / 5;
		margin-top: 0;
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
			width: 18vw;
			margin-top: 32px;
		}
		.pic.centre {
			width: 52vw;
		}
	}
</style>
