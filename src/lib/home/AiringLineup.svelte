<script lang="ts">
	import type { EmblaCarouselType } from 'embla-carousel';
	import emblaCarousel from 'embla-carousel-svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { AiringEntry } from '../anilist/queries';
	import { reveal } from '../actions/reveal';
	import { formatAirTime, formatCountdown, groupByDay } from '../airing';
	import { clock } from '../clock.svelte';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	// no entries yet: the strip holds its shape with blank cards
	let { entries }: { entries: AiringEntry[] | undefined } = $props();

	const upcoming = $derived((entries ?? []).filter((e) => e.airingAt > clock.now));
	const days = $derived(groupByDay(upcoming, clock.now));
	// one strip in time order; each day starts where the one before it ends
	const strip = $derived(days.flatMap((d) => d.items.map((entry) => ({ entry, day: d.day }))));
	const starts = $derived(
		days.map((d) => ({
			day: d.day,
			at: strip.findIndex((s) => s.day === d.day)
		}))
	);
	const time = (sec: number) => formatAirTime(sec).split(' ').at(-1);
	const dayLabel = (day: 'today' | 'tomorrow') =>
		day === 'today' ? m.day_today() : m.day_tomorrow();

	const reduce =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let embla: EmblaCarouselType | undefined;
	let first = $state(0);
	let canPrev = $state(false);
	let canNext = $state(false);
	// at the end of the strip the last day may never reach the left edge; it is the one on show
	const shownDay = $derived(canNext || !strip.length ? strip[first]?.day : strip.at(-1)!.day);

	const sync = () => {
		if (!embla) return;
		first = embla.slidesInView()[0] ?? embla.selectedScrollSnap();
		canPrev = embla.canScrollPrev();
		canNext = embla.canScrollNext();
	};
	function init(event: CustomEvent<EmblaCarouselType>) {
		embla = event.detail;
		embla
			.on('select', sync)
			.on('settle', sync)
			.on('slidesInView', sync)
			.on('reInit', sync)
			.on('resize', sync);
		sync();
	}
	// an episode that airs drops out of the strip
	$effect(() => {
		void strip.map((s) => s.entry.media.id + ':' + s.entry.episode).join();
		embla?.reInit();
	});

	// past the last stop every card belongs to it
	const go = (slide: number) =>
		embla?.scrollTo(Math.min(slide, embla.scrollSnapList().length - 1), reduce);

	// the arrows move a screenful at a time
	function page(direction: 1 | -1) {
		if (!embla) return;
		const seen = Math.max(1, embla.slidesInView().length - 1);
		go(Math.max(0, embla.selectedScrollSnap() + direction * seen));
	}
</script>

<section class="lineup page" aria-labelledby="lineup-title">
	<div class="top">
		<h2 id="lineup-title" class="head" use:reveal>{m.home_airing_title()}</h2>
		{#if strip.length}
			<div class="controls" use:reveal={1}>
				{#if starts.length > 1}
					<ul class="days">
						{#each starts as start (start.day)}
							<li>
								<button
									type="button"
									class="day"
									aria-pressed={shownDay === start.day}
									onclick={() => go(start.at)}
								>
									{dayLabel(start.day)}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				<div class="arrows">
					<button
						type="button"
						class="arrow"
						aria-label={m.strip_prev()}
						disabled={!canPrev}
						onclick={() => page(-1)}>←</button
					>
					<button
						type="button"
						class="arrow"
						aria-label={m.strip_next()}
						disabled={!canNext}
						onclick={() => page(1)}>→</button
					>
				</div>
			</div>
		{/if}
	</div>

	{#if !entries}
		<ol class="track" role="status" aria-label={m.loading()}>
			{#each { length: 10 }, i (i)}
				<li class="slide">
					<span class="ghost cover"></span>
					<span class="ghost ghost-line when-line"></span>
					<span class="ghost ghost-line"></span>
					<span class="ghost ghost-line short"></span>
				</li>
			{/each}
		</ol>
	{:else if strip.length === 0}
		<p class="empty">{m.home_airing_empty()}</p>
	{:else}
		<div
			class="viewport"
			use:reveal={2}
			use:emblaCarousel={{
				options: { align: 'start', dragFree: true, containScroll: 'trimSnaps', duration: 28 },
				plugins: []
			}}
			onemblaInit={init}
		>
			<ol class="track" aria-labelledby="lineup-title">
				{#each strip as { entry, day }, i (entry.media.id + ':' + entry.episode)}
					{@const opens = i === 0 || strip[i - 1].day !== day}
					<li class="slide" class:opens>
						<a href={animePath(entry.media.id)} class="show">
							<span
								class="cover"
								style:background-color={entry.media.coverImage?.color ?? 'var(--color-bg)'}
							>
								{#if entry.media.coverImage?.extraLarge ?? entry.media.coverImage?.large}
									<img
										src={entry.media.coverImage?.extraLarge ?? entry.media.coverImage?.large}
										alt=""
										width="460"
										height="690"
										loading="lazy"
										draggable="false"
									/>
								{/if}
							</span>
							<span class="when tabular">
								{#if opens && i > 0}<span class="which">{dayLabel(day)}</span>{/if}
								{time(entry.airingAt)}
							</span>
							<span class="left tabular">{formatCountdown(entry.airingAt - clock.now)}</span>
							<span class="title">{displayTitle(entry.media.title ?? {})}</span>
							<span class="meta tabular"
								>EP {entry.episode}{#if entry.media.format}
									· {entry.media.format.replace('_', ' ')}{/if}</span
							>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</section>

<style>
	.lineup {
		padding-block: var(--section);
		background: var(--color-surface);
		overflow: hidden;
		--ghost: var(--color-bg);
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
		margin-bottom: var(--space-4);
	}
	.head {
		font-size: var(--text-section);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	.empty {
		font-size: var(--text-lead);
	}
	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.days,
	.arrows {
		display: flex;
		gap: var(--space-1);
		list-style: none;
	}
	.day {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 36px;
		padding: 0 14px;
		background: var(--color-bg);
		font-size: var(--text-small);
		font-weight: 600;
		transition:
			background-color var(--t-ui) var(--ease-out),
			color var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.day[aria-pressed='true'] {
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.arrow {
		display: grid;
		place-items: center;
		width: 44px;
		height: 36px;
		background: var(--color-bg);
		font-weight: 600;
		transition:
			background-color var(--t-ui) var(--ease-out),
			opacity var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.arrow:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.day:active,
	.arrow:not(:disabled):active {
		transform: scale(0.95);
	}
	@media (hover: hover) and (pointer: fine) {
		.day:not([aria-pressed='true']):hover,
		.arrow:not(:disabled):hover {
			background: var(--color-raised);
		}
	}
	.viewport {
		overflow: hidden;
		cursor: grab;
		touch-action: pan-y pinch-zoom;
	}
	.viewport:active {
		cursor: grabbing;
	}
	.track {
		display: flex;
		list-style: none;
	}
	.slide {
		flex: 0 0 clamp(148px, 11vw, 184px);
		min-width: 0;
		margin-right: 32px;
	}
	/* a new day leaves a wider gap before its first card */
	.slide.opens:not(:first-child) {
		margin-left: var(--space-5);
	}
	.show {
		display: grid;
		gap: 4px;
		user-select: none;
	}
	.cover {
		display: block;
		aspect-ratio: 2 / 3;
		margin-bottom: var(--space-1);
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--t-move) var(--ease-out);
	}
	.when-line {
		width: 45%;
		font-size: var(--text-lead);
	}
	.short {
		width: 60%;
	}
	.when {
		font-size: var(--text-lead);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.which {
		color: var(--color-accent-text);
	}
	.left,
	.meta {
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.title {
		margin-top: 4px;
		font-weight: 600;
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.2em;
		text-decoration-thickness: 0.07em;
		transition: text-decoration-color var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.show:hover img {
			transform: scale(1.04);
		}
		.show:hover .title {
			text-decoration-color: currentColor;
		}
	}
	@media (max-width: 720px) {
		.arrows {
			display: none;
		}
		.slide {
			flex-basis: 38vw;
			margin-right: 20px;
		}
		.slide.opens:not(:first-child) {
			margin-left: var(--space-4);
		}
	}
</style>
