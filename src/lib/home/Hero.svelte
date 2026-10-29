<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { pinProgressAction } from '../actions/pin-progress';
	import AiringBadge from '../components/AiringBadge.svelte';
	import { inkOn } from '../color';
	import { animePath, seasonHref } from '../paths';
	import { activeIndex } from '../scroll';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	let { season, items }: { season: Season; items: MediaCard[] | undefined } = $props();

	const panels = $derived(
		(items ?? []).filter((m) => m.coverImage?.extraLarge ?? m.coverImage?.large).slice(0, 3)
	);
	let progress = $state(0);
	const index = $derived(activeIndex(progress, panels.length));
	const active = $derived(panels[index]);
	const ground = $derived(active?.coverImage?.color ?? null);
	const ink = $derived(inkOn(ground));

	// the site bar sits over the hero: give it the same solid ink as the title
	$effect(() => {
		document.documentElement.style.setProperty('--hero-ink', ink);
		return () => document.documentElement.style.removeProperty('--hero-ink');
	});
</script>

<section
	class="hero"
	style:--panels={Math.max(panels.length, 1)}
	use:pinProgressAction={(p) => (progress = p)}
	aria-labelledby="hero-title"
>
	<div class="stage" style:background-color={ground ?? 'var(--color-bg)'} style:color={ink}>
		<h1 id="hero-title" class="title display">{seasonLabel(season)}</h1>
		<p class="lead">{m.home_title({ season: seasonLabel(season) })}</p>

		<div class="covers">
			{#each panels as media, i (media.id)}
				<a
					href={animePath(media.id)}
					class="cover"
					class:shown={i <= index}
					style:z-index={i}
					tabindex={i === index ? 0 : -1}
					aria-hidden={i !== index}
				>
					<img
						src={media.coverImage?.extraLarge ?? media.coverImage?.large}
						alt={displayTitle(media.title ?? {})}
						width="460"
						height="690"
						fetchpriority={i === 0 ? 'high' : undefined}
					/>
				</a>
			{:else}
				<div class="cover placeholder shown"></div>
			{/each}
		</div>

		<p class="caption" aria-live="polite">
			{#if active}
				<span>{m.home_trending_caption()} {index + 1}/{panels.length}</span>
				<a href={animePath(active.id)} class="link name">{displayTitle(active.title ?? {})}</a>
				<AiringBadge media={active} showTime />
			{:else}
				<span>{m.home_hero_lead()}</span>
			{/if}
		</p>
		<a href={seasonHref(season)} class="btn btn-ink action">{m.home_hero_action()}</a>
	</div>
</section>

<style>
	.hero {
		height: calc(var(--panels) * 100svh);
		margin-top: calc(-1 * var(--nav-h));
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
		display: grid;
		grid-template-columns: 1fr minmax(0, auto) 1fr;
		grid-template-rows: auto auto minmax(0, 1fr);
		column-gap: var(--gutter);
		padding: calc(var(--nav-h) + 8px) var(--gutter) 0;
		transition:
			background-color 700ms var(--ease-in-out),
			color 400ms ease;
	}
	.title {
		grid-column: 1 / -1;
		text-align: center;
		font-size: var(--text-display);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.lead {
		grid-column: 1 / -1;
		margin-top: 16px;
		text-align: center;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.covers {
		grid-column: 2;
		grid-row: 3;
		position: relative;
		margin-top: 32px;
		height: 100%;
		aspect-ratio: 2 / 3;
	}
	.cover {
		position: absolute;
		inset: 0;
		clip-path: inset(100% 0 0 0);
		transition: clip-path 900ms var(--ease-in-out);
	}
	.cover.shown {
		clip-path: inset(0);
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.08);
		transition: transform 1400ms var(--ease-soft);
	}
	.cover.shown img {
		transform: none;
	}
	.placeholder {
		background: var(--color-surface);
	}
	.caption {
		grid-column: 1;
		grid-row: 3;
		align-self: end;
		display: grid;
		gap: 4px;
		max-width: 28ch;
		padding-bottom: 32px;
		font-size: var(--text-small);
		font-weight: 600;
	}
	.caption :global(span) {
		color: inherit;
	}
	.name {
		font-size: var(--text-body);
	}
	.action {
		grid-column: 3;
		grid-row: 3;
		align-self: end;
		justify-self: end;
		margin-bottom: 32px;
	}
	@media (prefers-reduced-motion: reduce) {
		.cover,
		.cover img,
		.stage {
			transition: none;
		}
	}
	@media (max-width: 900px) {
		.stage {
			grid-template-columns: 1fr auto;
			grid-template-rows: auto auto minmax(0, 1fr) auto;
			padding-bottom: 20px;
		}
		.title {
			font-size: 15vw;
			text-align: left;
		}
		.lead {
			text-align: left;
			font-size: var(--text-lead);
		}
		.covers {
			grid-column: 1 / -1;
			grid-row: 3;
			justify-self: center;
			margin-top: 16px;
		}
		.caption {
			grid-column: 1;
			grid-row: 4;
			padding: 16px 0 0;
		}
		.action {
			grid-column: 2;
			grid-row: 4;
			margin: 0;
		}
	}
</style>
