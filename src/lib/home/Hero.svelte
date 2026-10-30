<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { EmblaCarouselType } from 'embla-carousel';
	import emblaCarousel from 'embla-carousel-svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { barTint } from '../actions/bar-tint';
	import { airingStatus, formatAirTime } from '../airing';
	import AiringBadge from '../components/AiringBadge.svelte';
	import Countdown from '../components/Countdown.svelte';
	import { clock } from '../clock.svelte';
	import { inkOn } from '../color';
	import type { HeroReason } from '../hero-pick';
	import { animePath, seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	// items arrive in airing order: the up-next queue, soonest first
	let {
		season,
		items,
		reason
	}: { season: Season; items: MediaCard[] | undefined; reason: HeroReason } = $props();

	const panels = $derived(
		(items ?? []).filter((m) => m.coverImage?.extraLarge ?? m.coverImage?.large).slice(0, 3)
	);
	let index = $state(0);
	const active = $derived(panels[Math.min(index, panels.length - 1)]);
	const ground = $derived(active?.coverImage?.color ?? null);
	const ink = $derived(inkOn(ground));
	const status = $derived(active ? airingStatus(active, clock.now) : null);
	const why = $derived(reason === 'list' ? m.home_hero_why_list() : m.home_hero_why_soon());

	const reduce =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let embla: EmblaCarouselType | undefined;
	// read out by the stable live region, and only when the visitor picks a step or swipes
	let announced = $state('');

	function init(event: CustomEvent<EmblaCarouselType>) {
		embla = event.detail;
		embla.on('select', () => {
			index = embla!.selectedScrollSnap();
			const media = panels[index];
			const next = media && airingStatus(media, clock.now);
			announced =
				media && next?.kind === 'next'
					? m.home_hero_announce({
							title: displayTitle(media.title ?? {}),
							episode: String(next.episode),
							time: formatAirTime(next.airingAt)
						})
					: media
						? displayTitle(media.title ?? {})
						: '';
		});
	}

	// a refetch can reorder or replace the titles under the carousel
	$effect(() => {
		void panels.map((p) => p.id).join();
		embla?.reInit();
	});

	function jump(i: number) {
		embla?.scrollTo(i, reduce);
	}
</script>

<section
	class="hero"
	use:barTint={{ bg: ground ?? 'var(--color-bg)', ink }}
	aria-labelledby="hero-title"
>
	<div class="stage" style:background-color={ground ?? 'var(--color-bg)'} style:color={ink}>
		<h1 id="hero-title" class="sr-only">{m.home_title({ season: seasonLabel(season) })}</h1>
		<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announced}</p>

		<div class="now">
			{#if active}
				<!-- the outgoing title fades where it stands while the next one rises into the same place -->
				<div class="slot">
					{#key active.id}
						<div class="panel" out:fade={{ duration: 150, easing: cubicOut }}>
							<a href={animePath(active.id)} class="link name">{displayTitle(active.title ?? {})}</a
							>
							{#if status?.kind === 'next'}
								<p class="airs">
									{why} ·
									{m.home_hero_airs({
										episode: String(status.episode),
										time: formatAirTime(status.airingAt)
									})}
								</p>
								<div class="clock"><Countdown airingAt={status.airingAt} /></div>
							{:else}
								<p class="airs">{why} · <AiringBadge media={active} /></p>
							{/if}
						</div>
					{/key}
				</div>
				<p class="actions">
					<a
						href={animePath(active.id)}
						class="btn open"
						style:background-color={ink}
						style:color={ground ?? 'var(--color-bg)'}>{m.home_hero_open()}</a
					>
					<a href={seasonHref(season)} class="link season">{m.home_hero_action()}</a>
				</p>
				{#if panels.length > 1}
					<ul class="steps" aria-label={m.home_hero_queue()}>
						{#each panels as media, i (media.id)}
							<li>
								<button
									type="button"
									class="step"
									class:on={i === index}
									aria-current={i === index ? 'true' : undefined}
									aria-label={displayTitle(media.title ?? {})}
									title={displayTitle(media.title ?? {})}
									onclick={() => jump(i)}
								>
									<img src={media.coverImage?.large} alt="" width="44" height="66" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				<p class="airs">{m.home_hero_lead()}</p>
				<p class="actions">
					<a href={seasonHref(season)} class="btn btn-ink">{m.home_hero_action()}</a>
				</p>
			{/if}
		</div>

		<div
			class="covers"
			role="group"
			aria-roledescription="carousel"
			aria-label={m.home_hero_queue()}
		>
			{#if panels.length}
				<div
					class="viewport"
					use:emblaCarousel={{ options: { loop: true, duration: 32 }, plugins: [] }}
					onemblaInit={init}
				>
					<div class="track">
						{#each panels as media, i (media.id)}
							<a
								href={animePath(media.id)}
								class="cover"
								class:on={i === index}
								tabindex={i === index ? 0 : -1}
								aria-hidden={i !== index}
							>
								<img
									src={media.coverImage?.extraLarge ?? media.coverImage?.large}
									alt={displayTitle(media.title ?? {})}
									width="460"
									height="690"
									draggable="false"
									data-cover={i === index ? '' : undefined}
									fetchpriority={i === 0 ? 'high' : undefined}
								/>
							</a>
						{/each}
					</div>
				</div>
			{:else}
				<div class="cover placeholder ghost"></div>
			{/if}
		</div>
	</div>
</section>

<style>
	.hero {
		margin-top: calc(-1 * var(--nav-h));
	}
	.stage {
		/* ends above the strip's top padding (--section) with room for its heading, so the
		   next 24 hours start in the first screen: at 1440x900 the stage is 714px and the heading sits at ~836px */
		height: calc(100svh - var(--section) - 4rem);
		min-height: 520px;
		max-height: 960px;
		overflow: hidden;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-rows: minmax(0, 1fr);
		column-gap: var(--gutter);
		padding: calc(var(--nav-h) + var(--space-3)) var(--gutter) var(--space-4);
		transition:
			background-color var(--t-scene) var(--ease-out),
			color var(--t-scene) var(--ease-out);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	/* the clock is the hero: what is next, how long until it airs, and the way in */
	.now {
		grid-column: 1 / 8;
		align-self: center;
		display: grid;
		gap: var(--space-4);
		max-width: 760px;
	}
	.slot {
		display: grid;
	}
	.panel {
		grid-area: 1 / 1;
		display: grid;
		gap: var(--space-1);
	}
	.name {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.airs {
		font-size: var(--text-body);
		font-weight: 600;
	}
	.airs :global(span) {
		color: inherit;
	}
	.clock {
		margin-top: var(--space-3);
		--countdown-size: clamp(3rem, 1.6rem + 4.6vw, 7rem);
	}
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	/* its colours are the stage's inverted, so they turn on the stage's clock */
	.open {
		transition:
			transform var(--t-press) var(--ease-out),
			opacity var(--t-ui) var(--ease-out),
			background-color var(--t-scene) var(--ease-out),
			color var(--t-scene) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.open:hover {
			opacity: 0.86;
		}
	}
	.season {
		font-weight: 600;
		text-decoration-color: currentColor;
	}
	.steps {
		display: flex;
		gap: var(--space-1);
		list-style: none;
	}
	.step {
		display: grid;
		gap: 6px;
		min-width: 44px;
		opacity: 0.5;
		transition:
			opacity var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.step img {
		width: 44px;
		height: 66px;
		object-fit: cover;
	}
	/* a block under the title on screen marks the step the visitor is on */
	.step::after {
		content: '';
		height: 4px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--t-ui) var(--ease-out);
	}
	.step.on {
		opacity: 1;
	}
	.step.on::after {
		transform: none;
	}
	.step:active {
		transform: scale(0.96);
	}
	@media (hover: hover) and (pointer: fine) {
		.step:hover {
			opacity: 1;
		}
	}
	.covers {
		grid-column: 8 / -1;
		position: relative;
		justify-self: end;
		height: 100%;
		max-width: 100%;
		aspect-ratio: 2 / 3;
	}
	.viewport,
	.placeholder {
		height: 100%;
		overflow: hidden;
	}
	.viewport {
		cursor: grab;
		touch-action: pan-y pinch-zoom;
	}
	.viewport:active {
		cursor: grabbing;
	}
	.track {
		display: flex;
		height: 100%;
	}
	.cover {
		flex: 0 0 100%;
		min-width: 0;
		height: 100%;
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		transform: scale(1.06);
		transition: transform var(--t-scene) var(--ease-out);
	}
	.cover.on img {
		transform: none;
	}
	.placeholder {
		background: var(--color-surface);
	}
	@media (prefers-reduced-motion: no-preference) {
		/* the words rise on the scene clock the ground and cover already change on, a beat behind the fade */
		.panel > * {
			animation: rise var(--t-scene) var(--ease-out) 60ms both;
		}
		.panel > :nth-child(2) {
			animation-delay: 100ms;
		}
		.panel > :nth-child(n + 3) {
			animation-delay: 140ms;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(var(--rise));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cover img,
		.stage {
			transition: none;
		}
	}
	@media (max-width: 900px) {
		/* title, clock and buttons stay in the first screen; the cover leads but takes ~42svh */
		.stage {
			height: auto;
			min-height: 0;
			max-height: none;
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto;
			row-gap: var(--space-3);
			padding-bottom: var(--space-4);
		}
		.covers {
			grid-column: 1;
			grid-row: 1;
			justify-self: center;
			height: clamp(240px, 42svh, 400px);
		}
		.now {
			grid-column: 1;
			grid-row: 2;
			gap: var(--space-2);
			max-width: none;
		}
		.clock {
			margin-top: var(--space-1);
			--countdown-size: clamp(1.75rem, 8vw, 2.75rem);
		}
		.name {
			font-size: var(--text-lead);
		}
		.airs {
			font-size: var(--text-small);
		}
	}
</style>
