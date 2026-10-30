<script lang="ts">
	import type { EmblaCarouselType } from 'embla-carousel';
	import Autoplay from 'embla-carousel-autoplay';
	import emblaCarousel from 'embla-carousel-svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { barTint } from '../actions/bar-tint';
	import { airingStatus, formatAirTime } from '../airing';
	import AiringBadge from '../components/AiringBadge.svelte';
	import Countdown from '../components/Countdown.svelte';
	import { clock } from '../clock.svelte';
	import { inkOn } from '../color';
	import { animePath, seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';
	import { displayTitle } from '../text';

	let { season, items }: { season: Season; items: MediaCard[] | undefined } = $props();

	const panels = $derived(
		(items ?? []).filter((m) => m.coverImage?.extraLarge ?? m.coverImage?.large).slice(0, 3)
	);
	let index = $state(0);
	const active = $derived(panels[Math.min(index, panels.length - 1)]);
	const ground = $derived(active?.coverImage?.color ?? null);
	const ink = $derived(inkOn(ground));
	const status = $derived(active ? airingStatus(active, clock.now) : null);

	const DELAY = 6000;
	const reduce =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let embla: EmblaCarouselType | undefined;
	// the step's fill runs only while the slides move on by themselves
	let running = $state(false);

	function init(event: CustomEvent<EmblaCarouselType>) {
		embla = event.detail;
		embla.on('select', () => (index = embla!.selectedScrollSnap()));
		embla.on('autoplay:play', () => (running = true));
		embla.on('autoplay:stop', () => (running = false));
		running = embla.plugins().autoplay?.isPlaying() ?? false;
	}

	// a refetch can reorder or replace the titles under the carousel
	$effect(() => {
		void panels.map((p) => p.id).join();
		embla?.reInit();
	});

	function jump(i: number) {
		embla?.scrollTo(i, reduce);
	}

	// pause while the pointer rests on the slides or a focus is inside the hero, and off screen
	let section: HTMLElement;
	let visible = true;
	let holding = false;
	const sync = () => {
		const autoplay = embla?.plugins().autoplay;
		if (!autoplay) return;
		if (visible && !holding) autoplay.play();
		else autoplay.stop();
	};
	$effect(() => {
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			sync();
		});
		io.observe(section);
		return () => io.disconnect();
	});
	const hold = (on: boolean) => () => {
		holding = on;
		sync();
	};
</script>

<section
	class="hero"
	bind:this={section}
	use:barTint={{ bg: ground ?? 'var(--color-bg)', ink }}
	aria-labelledby="hero-title"
	onfocusin={(e) => {
		// a click leaves focus on the step; only keyboard focus holds the slides
		if ((e.target as Element).matches(':focus-visible')) hold(true)();
	}}
	onfocusout={hold(false)}
>
	<div class="stage" style:background-color={ground ?? 'var(--color-bg)'} style:color={ink}>
		<div class="words">
			<h1 id="hero-title" class="title display">{seasonLabel(season)}</h1>
			<p class="lead">{m.home_title({ season: seasonLabel(season) })}</p>
			{#if panels.length > 1}
				<ul
					class="steps"
					onpointerenter={hold(true)}
					onpointerleave={hold(false)}
					class:running
					style:--delay="{DELAY}ms"
					aria-label={m.home_trending_caption()}
				>
					{#each panels as media, i (media.id)}
						<li>
							<button
								type="button"
								class="step"
								class:on={i === index}
								aria-current={i === index ? 'true' : undefined}
								aria-label={displayTitle(media.title ?? {})}
								onclick={() => jump(i)}
							>
								<img src={media.coverImage?.large} alt="" width="36" height="54" />
								<span>{displayTitle(media.title ?? {})}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="now">
			{#if active}
				{#key active.id}
					<div class="panel">
						<p class="which" aria-live="polite">
							<span>{m.home_trending_caption()} {index + 1}/{panels.length}</span>
							<a href={animePath(active.id)} class="link name">{displayTitle(active.title ?? {})}</a
							>
						</p>
						{#if status?.kind === 'next'}
							<p class="airs">
								{m.home_hero_airs({
									episode: String(status.episode),
									time: formatAirTime(status.airingAt)
								})}
							</p>
							<Countdown airingAt={status.airingAt} />
						{:else}
							<p class="airs"><AiringBadge media={active} /></p>
						{/if}
					</div>
				{/key}
				<p class="actions">
					<a
						href={animePath(active.id)}
						class="btn open"
						style:background-color={ink}
						style:color={ground ?? 'var(--color-bg)'}>{m.home_hero_open()}</a
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
			aria-label={m.home_trending_caption()}
			onpointerenter={hold(true)}
			onpointerleave={hold(false)}
		>
			{#if panels.length}
				<div
					class="viewport"
					use:emblaCarousel={{
						options: { loop: true, duration: 32 },
						plugins: reduce
							? []
							: [Autoplay({ delay: DELAY, stopOnInteraction: false, stopOnFocusIn: false })]
					}}
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
									fetchpriority={i === 0 ? 'high' : undefined}
								/>
							</a>
						{/each}
					</div>
				</div>
			{:else}
				<div class="cover placeholder"></div>
			{/if}
		</div>
	</div>
</section>

<style>
	.hero {
		margin-top: calc(-1 * var(--nav-h));
	}
	.stage {
		height: 100svh;
		min-height: 640px;
		max-height: 1000px;
		overflow: hidden;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-rows: auto minmax(0, 1fr);
		column-gap: var(--gutter);
		padding: calc(var(--nav-h) + 8px) var(--gutter) 32px;
		transition:
			background-color 700ms var(--ease-in-out),
			color 400ms ease;
	}
	.words {
		grid-column: 1 / 8;
		grid-row: 1;
	}
	.title {
		font-size: var(--text-display);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.lead {
		margin-top: 24px;
		max-width: 36ch;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	.steps {
		display: grid;
		gap: 4px;
		margin-top: 40px;
		max-width: 420px;
		list-style: none;
	}
	.step {
		position: relative;
		display: grid;
		grid-template-columns: 36px 1fr;
		align-items: center;
		gap: 14px;
		width: 100%;
		padding: 6px;
		text-align: left;
		font-size: var(--text-small);
		font-weight: 600;
		opacity: 0.62;
		transition:
			opacity var(--t-ui) ease,
			background-color var(--t-ui) ease,
			transform var(--t-press) var(--ease-out);
	}
	/* the active step fills with its tint; while the slides move on by themselves the fill
	   runs across the step in the time left before the next one */
	.step::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: color-mix(in srgb, currentColor 10%, transparent);
		transform: scaleX(0);
		transform-origin: left;
	}
	.step.on {
		opacity: 1;
	}
	.step.on::before {
		transform: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.running .step.on::before {
			animation: fill var(--delay) linear both;
		}
	}
	@keyframes fill {
		from {
			transform: scaleX(0.04);
		}
	}
	.steps li {
		isolation: isolate;
	}
	.step:active {
		transform: scale(0.98);
	}
	@media (hover: hover) and (pointer: fine) {
		.step:hover {
			opacity: 1;
		}
	}
	.step img {
		width: 36px;
		height: 54px;
		object-fit: cover;
	}
	.step span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.now {
		grid-column: 1 / 8;
		grid-row: 2;
		align-self: end;
		display: grid;
		gap: 28px;
		max-width: 680px;
		/* the home page's one big clock */
		--countdown-size: clamp(2.5rem, 1.6rem + 3.6vw, 5.5rem);
	}
	.panel {
		display: grid;
		gap: 12px;
	}
	.which {
		display: grid;
		gap: 6px;
		font-size: var(--text-small);
		font-weight: 600;
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
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 24px;
	}
	.open {
		transition:
			transform var(--t-press) var(--ease-out),
			opacity var(--t-hover) ease;
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
	.covers {
		grid-column: 8 / -1;
		grid-row: 1 / -1;
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
		transition: transform 1400ms var(--ease-soft);
	}
	.cover.on img {
		transform: none;
	}
	.placeholder {
		background: var(--color-surface);
	}
	@media (prefers-reduced-motion: no-preference) {
		.panel {
			animation: rise 700ms var(--ease-expo) both;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cover img,
		.stage {
			transition: none;
		}
	}
	@media (max-width: 900px) {
		.stage {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr) auto;
			row-gap: 20px;
			padding-bottom: 20px;
		}
		.words,
		.now {
			grid-column: 1;
		}
		.title {
			font-size: 15vw;
		}
		.steps {
			display: flex;
			gap: 6px;
			margin-top: 16px;
		}
		.step {
			grid-template-columns: 36px;
			padding: 4px;
		}
		.step span {
			display: none;
		}
		.lead {
			margin-top: 12px;
		}
		.covers {
			grid-column: 1;
			grid-row: 2;
			justify-self: center;
		}
		.now {
			grid-row: 3;
			gap: 16px;
			max-width: none;
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
