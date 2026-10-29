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
		(items ?? []).filter((m) => m.coverImage?.extraLarge ?? m.coverImage?.large).slice(0, 5)
	);
	let progress = $state(0);
	const index = $derived(activeIndex(progress, panels.length));
	const active = $derived(panels[index]);
	const ground = $derived(active?.coverImage?.color ?? null);
	const ink = $derived(inkOn(ground));
</script>

<section
	class="hero"
	style:--panels={Math.max(panels.length, 1)}
	use:pinProgressAction={(p) => (progress = p)}
	aria-labelledby="hero-title"
>
	<div class="stage" style:background-color={ground ?? 'var(--color-bg)'} style:color={ink}>
		<h1 id="hero-title" class="title display">{seasonLabel(season)}</h1>

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
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchpriority={i === 0 ? 'high' : undefined}
					/>
				</a>
			{:else}
				<div class="cover placeholder shown"></div>
			{/each}
		</div>

		<p class="lead">{m.home_hero_lead()}</p>

		<div class="aside">
			{#if active}
				<p class="caption" aria-live="polite">
					<span>{m.home_trending_caption()} {index + 1}/{panels.length}</span>
					<a href={animePath(active.id)} class="link name">{displayTitle(active.title ?? {})}</a>
					<AiringBadge media={active} showTime />
				</p>
			{/if}
			<a href={seasonHref(season)} class="btn btn-ink">{m.home_hero_action()}</a>
		</div>
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
		transition:
			background-color 700ms var(--ease-in-out),
			color 400ms ease;
	}
	.title {
		position: absolute;
		z-index: 10;
		top: 96px;
		left: 0;
		right: 0;
		text-align: center;
		font-size: var(--text-display);
		text-transform: uppercase;
		white-space: nowrap;
		color: #fff;
		mix-blend-mode: difference;
		pointer-events: none;
	}
	.covers {
		position: absolute;
		top: 90px;
		bottom: 0;
		left: 50%;
		width: min(37vw, calc((100svh - 90px) * 2 / 3));
		transform: translateX(-50%);
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
	.lead {
		position: absolute;
		left: var(--gutter);
		bottom: 32px;
		max-width: 26ch;
		font-weight: 600;
		font-size: var(--text-body);
		line-height: 1.35;
	}
	.aside {
		position: absolute;
		right: var(--gutter);
		bottom: 32px;
		display: grid;
		justify-items: end;
		gap: 16px;
		max-width: 26ch;
		text-align: right;
	}
	.caption {
		display: grid;
		gap: 2px;
		font-size: var(--text-small);
		font-weight: 600;
	}
	.caption :global(span) {
		color: inherit;
	}
	.name {
		font-size: var(--text-body);
	}
	@media (prefers-reduced-motion: reduce) {
		.cover,
		.cover img,
		.stage {
			transition: none;
		}
	}
	@media (max-width: 720px) {
		.stage {
			display: flex;
			flex-direction: column;
			gap: 12px;
			padding: calc(var(--nav-h) + 4px) var(--gutter) 20px;
		}
		.title {
			position: relative;
			top: 0;
			font-size: 15vw;
			text-align: left;
		}
		.covers {
			position: relative;
			top: auto;
			left: auto;
			transform: none;
			flex: 1;
			width: auto;
			margin-top: -9vw;
		}
		.lead {
			position: static;
			max-width: none;
			font-size: var(--text-small);
		}
		.aside {
			position: static;
			grid-template-columns: 1fr auto;
			align-items: end;
			justify-items: start;
			max-width: none;
			text-align: left;
		}
	}
</style>
