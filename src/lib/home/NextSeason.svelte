<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { pinProgressAction } from '../actions/pin-progress';
	import { reveal } from '../actions/reveal';
	import MediaGrid from '../components/MediaGrid.svelte';
	import { animePath, seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	let { season, items }: { season: Season; items: MediaCard[] } = $props();

	const withArt = $derived(items.filter((i) => i.coverImage?.extraLarge ?? i.coverImage?.large));
	const trio = $derived(
		withArt.length >= 3 ? [withArt[1], withArt[0], withArt[2]] : withArt.slice(0, 3)
	);
	const rest = $derived(items.filter((i) => !trio.includes(i)));
	let progress = $state(0);
	// each picture rises at its own speed: centre fastest
	const speeds = [0.75, 1, 0.65];
</script>

<section class="next" aria-labelledby="next-title">
	<div class="wrap" use:pinProgressAction={(p) => (progress = p)}>
		<div class="stage">
			<div class="intro page">
				<h2 id="next-title" class="head">{m.home_next_title({ season: seasonLabel(season) })}</h2>
				<p>{m.home_next_lead()}</p>
			</div>
			<div class="trio" style:--p={progress}>
				{#each trio as media, i (media.id)}
					<a
						href={animePath(media.id)}
						class="pic"
						class:centre={i === 1}
						style:transform="translateY({(1 - Math.min(1, progress * 1.6 * speeds[i])) * 28}%)
						scale({i === 1 ? 0.82 + 0.18 * Math.min(1, progress * 1.6) : 1})"
					>
						<img
							src={media.coverImage?.extraLarge ?? media.coverImage?.large}
							alt={displayTitle(media.title ?? {})}
							fetchpriority="low"
							width="460"
							height="690"
						/>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<div class="more page">
		{#if rest.length}<MediaGrid items={rest} />{/if}
		<p class="action" use:reveal>
			<a href={seasonHref(season)} class="btn"
				>{m.home_next_action({ season: seasonLabel(season) })}</a
			>
		</p>
	</div>
</section>

<style>
	.wrap {
		height: 160svh;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto 1fr;
	}
	.intro {
		padding-top: 10svh;
		text-align: center;
		display: grid;
		gap: 12px;
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
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 10px;
		padding-top: 40px;
	}
	.pic {
		flex: 0 0 auto;
		width: min(360px, 25vw);
		aspect-ratio: 2 / 3;
		margin-top: 55px;
		overflow: hidden;
		transform-origin: top center;
		will-change: transform;
	}
	.pic.centre {
		width: min(520px, 36vw);
		aspect-ratio: 4 / 5;
		margin-top: 0;
	}
	.pic img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.more {
		display: grid;
		gap: 48px;
		padding-block: 96px 160px;
	}
	@media (prefers-reduced-motion: reduce) {
		.wrap {
			height: auto;
		}
		.stage {
			position: static;
			height: auto;
		}
		.pic {
			transform: none !important;
		}
	}
	@media (max-width: 720px) {
		.pic {
			width: 20vw;
		}
		.pic.centre {
			width: 64vw;
		}
	}
</style>
