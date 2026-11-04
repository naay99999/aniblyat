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
	import { heroGround, inkOn } from '../color';
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
	const ground = $derived(heroGround(active?.coverImage?.color));
	const ink = $derived(inkOn(ground));
	const status = $derived(active ? airingStatus(active, clock.now) : null);
	const why = $derived(reason === 'list' ? m.home_hero_why_list() : m.home_hero_why_soon());

	const reduce =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let embla: EmblaCarouselType | undefined;
	// read out by the stable live region, and only when the visitor picks a step or swipes
	let announced = $state('');

	// the queue turns on its own: the active bar fills over DWELL and its end moves to the next title.
	// It holds while the visitor points at or works in the hero, while it is off screen or the tab is
	// hidden, and once they pause it; with reduced motion it never turns on its own.
	const DWELL = 8000;
	let stopped = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	let offscreen = $state(false);
	let hidden = $state(false);
	let turning = false;
	const holding = $derived(stopped || hovering || focused || offscreen || hidden);
	const rotating = $derived(!reduce && panels.length > 1);

	function advance() {
		// the reduced-motion rule shortens every animation to nothing; it must not spin the queue
		if (!rotating || holding || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		turning = true;
		embla?.scrollNext();
	}

	// a mouse resting on the words or the queue holds it; the rest of the hero is just picture
	function hold(node: HTMLElement) {
		const enter = (e: PointerEvent) => (hovering = e.pointerType === 'mouse');
		const leave = () => (hovering = false);
		node.addEventListener('pointerenter', enter);
		node.addEventListener('pointerleave', leave);
		return {
			destroy() {
				node.removeEventListener('pointerenter', enter);
				node.removeEventListener('pointerleave', leave);
				hovering = false;
			}
		};
	}

	function watch(node: HTMLElement) {
		const io = new IntersectionObserver(([e]) => (offscreen = !e.isIntersecting));
		io.observe(node);
		const onVisibility = () => (hidden = document.hidden);
		document.addEventListener('visibilitychange', onVisibility);
		return {
			destroy() {
				io.disconnect();
				document.removeEventListener('visibilitychange', onVisibility);
			}
		};
	}

	function init(event: CustomEvent<EmblaCarouselType>) {
		embla = event.detail;
		embla.on('select', () => {
			index = embla!.selectedScrollSnap();
			// a turn of the queue on its own is not announced; only the visitor's own picks are
			if (turning) {
				turning = false;
				return;
			}
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

<section class="hero" use:barTint={{ bg: ground, ink }} use:watch aria-labelledby="hero-title">
	<div
		class="stage"
		style:background-color={ground}
		style:color={ink}
		onfocusin={(e) => (focused = (e.target as Element).matches(':focus-visible'))}
		onfocusout={(e) =>
			(focused = e.currentTarget.contains(e.relatedTarget as Node | null) && focused)}
	>
		<h1 id="hero-title" class="sr-only">{m.home_title({ season: seasonLabel(season) })}</h1>
		<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{announced}</p>

		<div class="now" use:hold>
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
						style:color={ground}>{m.home_hero_open()}</a
					>
					<a href={seasonHref(season)} class="link season">{m.home_hero_action()}</a>
				</p>
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
							<!-- the whole cover, standing at the right edge: a banner is too wide for the hero's box -->
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

		<!-- the queue along the foot of the hero: the title on screen is the long bar, filling until the next -->
		{#if panels.length > 1}
			<div class="pager" use:hold>
				<ul class="bars" aria-label={m.home_hero_queue()}>
					{#each panels as media, i (media.id)}
						<li>
							<button
								type="button"
								class="bar"
								class:on={i === index}
								aria-current={i === index ? 'true' : undefined}
								aria-label={displayTitle(media.title ?? {})}
								title={displayTitle(media.title ?? {})}
								onclick={() => jump(i)}
							>
								<span class="rail">
									{#if i === index}
										<span
											class="fill"
											class:run={rotating}
											class:held={holding}
											style:--dwell="{DWELL}ms"
											onanimationend={advance}
										></span>
									{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
				{#if rotating}
					<button
						type="button"
						class="hold"
						aria-label={stopped ? m.home_hero_play() : m.home_hero_pause()}
						title={stopped ? m.home_hero_play() : m.home_hero_pause()}
						onclick={() => (stopped = !stopped)}
					>
						<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" fill="currentColor">
							{#if stopped}
								<path d="M2.5 1.2v9.6L10.5 6z" />
							{:else}
								<rect x="2" y="1.5" width="2.8" height="9" />
								<rect x="7.2" y="1.5" width="2.8" height="9" />
							{/if}
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.hero {
		margin-top: calc(-1 * var(--nav-h));
	}
	.stage {
		/* the same height as a title's hero, so its banner lands in the same box when the visitor goes in */
		min-height: min(100svh, 920px);
		position: relative;
		overflow: hidden;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-rows: minmax(0, 1fr) auto;
		column-gap: var(--gutter);
		padding: calc(var(--nav-h) + var(--space-3)) var(--gutter) var(--space-3);
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
		grid-column: 1 / 7;
		grid-row: 1;
		position: relative;
		z-index: 1;
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
	.pager {
		grid-column: 1 / -1;
		grid-row: 2;
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		/* the bars' own padding makes their targets; the first bar still lines up with the words */
		margin-left: -6px;
	}
	.bars {
		display: flex;
		list-style: none;
	}
	.bar {
		display: grid;
		place-items: center;
		min-height: 32px;
		padding-inline: 6px;
	}
	/* short for the titles waiting, long for the one on screen */
	.rail {
		position: relative;
		display: block;
		width: 20px;
		height: 4px;
		overflow: hidden;
		background: color-mix(in srgb, currentColor 30%, transparent);
		transition:
			width var(--t-move) var(--ease-out),
			background-color var(--t-ui) var(--ease-out);
	}
	.bar.on .rail {
		width: 72px;
	}
	@media (hover: hover) and (pointer: fine) {
		.bar:not(.on):hover .rail {
			background: color-mix(in srgb, currentColor 60%, transparent);
		}
	}
	.fill {
		position: absolute;
		inset: 0;
		background: currentColor;
		transform-origin: left;
	}
	.fill.run {
		animation: fill var(--dwell) linear both;
	}
	.fill.held {
		animation-play-state: paused;
	}
	@keyframes fill {
		from {
			transform: scaleX(0);
		}
	}
	.hold {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		opacity: 0.7;
		transition: opacity var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.hold:hover {
			opacity: 1;
		}
	}
	/*
	 * the field the cover stands in, from under the words to the right edge; its own fade lets a
	 * cover leaving to the left melt away rather than hit an edge
	 */
	.covers {
		position: absolute;
		inset: var(--nav-h) 0 0 30%;
		--ghost: color-mix(in srgb, currentColor 8%, transparent);
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 45%);
		mask-image: linear-gradient(90deg, transparent, #000 45%);
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
	/*
	 * the cover whole, full height at the right edge, fading into the ground on its left. The fade is
	 * the picture's own, as on a title's page, so the hand-off going in carries it along
	 */
	.cover img {
		display: block;
		width: auto;
		max-width: 100%;
		height: 100%;
		margin-left: auto;
		aspect-ratio: 2 / 3;
		object-fit: cover;
		user-select: none;
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 35%);
		mask-image: linear-gradient(90deg, transparent, #000 35%);
		transform: scale(1.06);
		transition: transform var(--t-scene) var(--ease-out);
	}
	.cover.on img {
		transform: none;
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
		/* the picture leads, edge to edge, and fades down; then the title, clock and buttons, then the queue */
		.stage {
			min-height: 0;
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto auto;
			row-gap: var(--space-3);
			padding-bottom: var(--space-3);
		}
		.pager {
			grid-row: 3;
		}
		.covers {
			position: relative;
			inset: auto;
			grid-column: 1;
			grid-row: 1;
			margin-inline: calc(-1 * var(--gutter));
			margin-top: calc(-1 * var(--space-3));
			height: min(56.25vw, 42svh);
			-webkit-mask-image: none;
			mask-image: none;
		}
		.cover img {
			margin-inline: auto;
			-webkit-mask-image: linear-gradient(#000 65%, transparent);
			mask-image: linear-gradient(#000 65%, transparent);
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
