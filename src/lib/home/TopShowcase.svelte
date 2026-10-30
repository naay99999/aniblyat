<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { m } from '#lib/paraglide/messages.js';
	import type { RankedMedia } from '../rank';
	import { reveal } from '../actions/reveal';
	import AiringBadge from '../components/AiringBadge.svelte';
	import SaveButton from '../components/SaveButton.svelte';
	import { inkOn } from '../color';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	// no items yet: the list and the card hold their shape with blanks
	let { items }: { items: RankedMedia[] | undefined } = $props();

	const ranked = $derived((items ?? []).slice(0, 10));
	let picked = $state(0);
	const current = $derived(ranked[Math.min(picked, ranked.length - 1)]);

	let stage = $state<HTMLDivElement>();
	let intro = $state<HTMLElement>();
	let list = $state<HTMLOListElement>();
	let feature = $state<HTMLElement>();

	// while the section is pinned, a rank lives at a scroll position: picking one scrolls there
	let goTo: ((rank: number) => boolean) | undefined;
	function pick(rank: number) {
		if (!goTo?.(rank)) picked = rank;
	}

	// arrow keys walk the ranks, like a list box
	function onkeydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		pick((picked + step + ranked.length) % ranked.length);
		list?.querySelectorAll<HTMLButtonElement>('.row')[picked]?.focus();
	}

	// the highlight slides from rank to rank instead of jumping
	let resized = $state(0);
	const marker = $derived.by(() => {
		void resized;
		const row = list?.querySelectorAll<HTMLElement>('.row')[picked];
		return row ? { top: row.offsetTop, height: row.offsetHeight } : null;
	});
	$effect(() => {
		if (!list) return;
		const ro = new ResizeObserver(() => resized++);
		ro.observe(list);
		return () => ro.disconnect();
	});

	/*
	 * On a wide screen the section pins under the bar while it is scrolled through: first the card
	 * rises to sit level with the heading, then each further stretch of scroll moves one rank down.
	 * Without motion, on a phone, or on a screen too short to hold it, the section stays as laid out.
	 */
	$effect(() => {
		const count = ranked.length;
		if (!count || !stage || !intro || !list || !feature) return;
		const [pinned, head, ranks, card] = [stage, intro, list, feature];
		let cancelled = false;
		let revert: (() => void) | undefined;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			if (cancelled) return;
			gsap.registerPlugin(ScrollTrigger);
			const mm = gsap.matchMedia();
			revert = () => mm.revert();

			mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
				const TOP = 72;
				let lift = 0;
				let step = 0;
				let last = -1;
				// the card follows the scroll on the site's move clock and arrival curve (--t-move, --ease-out)
				const moveCard = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'expo.out' });

				// the card starts level with the list and ends level with the heading
				const measure = () => {
					lift = ranks.offsetTop - head.offsetTop;
					step = Math.round(window.innerHeight * 0.28);
				};
				const fits = () =>
					TOP +
						Math.max(card.offsetHeight, ranks.offsetTop - head.offsetTop + ranks.offsetHeight) <=
					window.innerHeight - 16;

				const update = (self: ScrollTrigger) => {
					const into = self.progress * (self.end - self.start);
					moveCard(lift * (1 - Math.min(1, into / lift)));
					const rank = Math.min(count - 1, Math.max(0, Math.floor((into - lift) / step)));
					if (rank !== last) {
						last = rank;
						picked = rank;
					}
				};

				measure();
				if (!fits()) return;
				gsap.set(card, { y: lift });

				const trigger = ScrollTrigger.create({
					trigger: head,
					pin: pinned,
					start: `top ${TOP}px`,
					end: () => {
						measure();
						return `+=${lift + step * count}`;
					},
					invalidateOnRefresh: true,
					anticipatePin: 1,
					// settle on the middle of a rank's stretch, never between two
					snap: {
						snapTo: (value) => {
							const total = lift + step * count;
							const stops = [
								0,
								...Array.from({ length: count }, (_, i) => lift + step * (i + 0.5))
							];
							const at = value * total;
							const near = stops.reduce((a, b) => (Math.abs(b - at) < Math.abs(a - at) ? b : a));
							return near / total;
						},
						duration: { min: 0.2, max: 0.5 },
						delay: 0.08,
						ease: 'power2.inOut'
					},
					onUpdate: update,
					onRefresh: update
				});

				goTo = (rank) => {
					if (!trigger.isActive) return false;
					window.scrollTo({ top: trigger.start + lift + step * (rank + 0.5), behavior: 'smooth' });
					return true;
				};
				return () => {
					goTo = undefined;
				};
			});
		})();

		return () => {
			cancelled = true;
			revert?.();
		};
	});

	const facts = (media: RankedMedia) =>
		[media.format?.replace('_', ' '), ...(media.genres ?? []).slice(0, 2)]
			.filter(Boolean)
			.join(' · ');
	const score = (media: RankedMedia) =>
		media.unscored ? m.unscored() : String(media.averageScore ?? '');
</script>

{#snippet actions(media: RankedMedia)}
	{@const title = displayTitle(media.title ?? {})}
	<div class="actions">
		<a href={animePath(media.id)} class="btn btn-ink">{m.home_top_open()}</a>
		<SaveButton
			item={{ id: media.id, title, cover: media.coverImage?.large ?? null }}
			variant="button"
		/>
	</div>
{/snippet}

<section class="top" aria-labelledby="top-title">
	<div class="stage page" bind:this={stage}>
		<header class="intro" bind:this={intro}>
			<h2 id="top-title" use:reveal>{m.home_top_title()}</h2>
			<p use:reveal={1}>{m.home_top_lead()}</p>
		</header>

		{#if !items}
			<ol class="ranks" role="status" aria-label={m.loading()}>
				{#each { length: 10 }, i (i)}
					<li class="row blank">
						<span class="ghost ghost-line"></span>
						<span class="ghost ghost-line"></span>
						<span class="ghost ghost-line"></span>
					</li>
				{/each}
			</ol>
			<div class="feature" aria-hidden="true">
				<span class="ghost banner-blank"></span>
				<div class="detail">
					<span class="ghost poster-blank"></span>
					<div class="info">
						<span class="ghost ghost-line name-blank"></span>
						<span class="ghost ghost-line name-blank short"></span>
						<span class="ghost ghost-line facts-blank"></span>
					</div>
				</div>
			</div>
		{:else}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<ol class="ranks" bind:this={list} {onkeydown} use:reveal={2}>
				{#if marker}
					<span
						class="marker"
						aria-hidden="true"
						style:transform="translateY({marker.top}px)"
						style:height="{marker.height}px"
					></span>
				{/if}
				{#each ranked as media, i (media.id)}
					<li>
						<button
							type="button"
							class="row"
							class:on={i === picked}
							aria-current={i === picked ? 'true' : undefined}
							aria-controls="top-feature"
							onclick={() => pick(i)}
						>
							<span class="rank tabular">{i + 1}</span>
							<span class="title">{displayTitle(media.title ?? {})}</span>
							<span class="score tabular">{score(media)}</span>
						</button>
						{#if i === picked}
							<div class="inline">
								{#if media.coverImage?.extraLarge ?? media.coverImage?.large}
									<img
										src={media.coverImage?.extraLarge ?? media.coverImage?.large}
										alt=""
										width="460"
										height="690"
										loading="lazy"
										data-cover
									/>
								{/if}
								<div class="inline-text">
									<p class="facts">{facts(media)}</p>
									<p class="facts"><AiringBadge {media} /></p>
									{@render actions(media)}
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ol>

			{#if current}
				{@const ground = current.coverImage?.color ?? null}
				<article
					id="top-feature"
					class="feature"
					bind:this={feature}
					style:background-color={ground ?? 'var(--color-ink)'}
					style:color={ground ? inkOn(ground) : 'var(--color-bg)'}
					aria-live="polite"
				>
					<!-- the card stays; the title on it fades out where it stands while the next one settles in -->
					{#key current.id}
						<div class="feature-body" out:fade={{ duration: 150, easing: cubicOut }}>
							<!-- every title keeps the same band, so the card holds its height between picks -->
							{#if current.bannerImage ?? current.coverImage?.extraLarge}
								<img
									class="banner"
									class:from-cover={!current.bannerImage}
									src={current.bannerImage ?? current.coverImage?.extraLarge}
									alt=""
									width="1900"
									height="400"
								/>
							{/if}
							<div class="detail">
								{#if current.coverImage?.extraLarge ?? current.coverImage?.large}
									<a href={animePath(current.id)} class="poster" tabindex="-1" aria-hidden="true">
										<img
											src={current.coverImage?.extraLarge ?? current.coverImage?.large}
											alt=""
											width="460"
											height="690"
											data-cover
										/>
									</a>
								{/if}
								<div class="info">
									<h3 class="name">
										<a href={animePath(current.id)} class="link"
											>{displayTitle(current.title ?? {})}</a
										>
									</h3>
									<p class="facts tabular">
										{m.home_top_rank({ rank: String(picked + 1) })} · {facts(current)}
									</p>
									<p class="big-score tabular">
										{score(current)}{#if !current.unscored}<span>/100</span>{/if}
									</p>
									<p class="facts"><AiringBadge media={current} showTime /></p>
									{@render actions(current)}
								</div>
							</div>
						</div>
					{/key}
				</article>
			{/if}
		{/if}
	</div>
</section>

<style>
	.intro {
		grid-column: 1 / 6;
		grid-row: 1;
		display: grid;
		gap: var(--space-1);
		margin-bottom: var(--space-4);
	}
	.intro h2 {
		font-size: var(--text-section);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
	}
	.intro p {
		max-width: 52ch;
	}
	.stage {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		/* the card spans both rows: what it adds goes below the list, not between heading and list */
		grid-template-rows: auto 1fr;
		column-gap: var(--gutter);
		align-items: start;
		padding-block: var(--section);
	}
	.ranks {
		grid-column: 1 / 6;
		grid-row: 2;
		position: relative;
		display: grid;
		gap: 2px;
		list-style: none;
		letter-spacing: -0.01em;
	}
	.row {
		position: relative;
		display: grid;
		grid-template-columns: 2.2ch 1fr auto;
		align-items: baseline;
		gap: var(--space-2);
		width: 100%;
		padding: 10px 12px;
		text-align: left;
		color: var(--color-muted);
		transition:
			background-color var(--t-ui) var(--ease-out),
			color var(--t-ui) var(--ease-out);
	}
	.row.on {
		color: var(--color-ink);
		font-weight: 700;
	}
	.marker {
		position: absolute;
		inset: 0 0 auto;
		background: var(--color-surface);
		transition:
			transform var(--t-move) var(--ease-out),
			height var(--t-move) var(--ease-out);
	}
	.blank {
		padding-block: 14px;
	}
	.blank .ghost:nth-child(2) {
		width: 70%;
	}
	.blank .ghost:nth-child(3) {
		width: 2ch;
	}
	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rank {
		color: var(--color-accent-text);
		font-weight: 600;
	}
	@media (hover: hover) and (pointer: fine) {
		.row:hover {
			color: var(--color-ink);
		}
		.row:active {
			transform: scale(0.99);
		}
	}
	.inline {
		display: none;
	}
	.feature {
		grid-column: 6 / -1;
		grid-row: 1 / span 2;
		display: grid;
		overflow: hidden;
		transition:
			background-color var(--t-scene) var(--ease-out),
			color var(--t-scene) var(--ease-out);
	}
	.feature-body {
		grid-area: 1 / 1;
		min-width: 0;
	}
	.banner {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 1;
		object-fit: cover;
	}
	.banner-blank {
		aspect-ratio: 4 / 1;
	}
	.poster-blank {
		aspect-ratio: 2 / 3;
	}
	.name-blank {
		height: 1em;
		font-size: var(--text-title);
	}
	.facts-blank {
		width: 40%;
	}
	.short {
		width: 60%;
	}
	.from-cover {
		object-position: center 22%;
	}
	.detail {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		gap: var(--space-4);
		padding: var(--space-4);
	}
	.poster img {
		width: 100%;
		aspect-ratio: 2 / 3;
		object-fit: cover;
	}
	.info {
		display: grid;
		align-content: start;
		gap: var(--space-1);
	}
	.facts {
		font-size: var(--text-small);
		font-weight: 600;
	}
	.facts :global(span) {
		color: inherit;
	}
	.name {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.big-score {
		margin-block: var(--space-2) var(--space-1);
		font-size: clamp(2.5rem, 1.8rem + 2vw, 3.75rem);
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.big-score span {
		font-size: 0.3em;
		letter-spacing: -0.02em;
		margin-left: 0.1em;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin-top: var(--space-2);
	}
	/* a pick swaps the card: the banner settles as the ground turns, the poster and the words follow it */
	@media (prefers-reduced-motion: no-preference) {
		.banner {
			animation: settle var(--t-scene) var(--ease-out) both;
		}
		.poster,
		.info > * {
			animation: rise var(--t-scene) var(--ease-out) 60ms both;
		}
		.info > :nth-child(2) {
			animation-delay: 100ms;
		}
		.info > :nth-child(n + 3) {
			animation-delay: 140ms;
		}
	}
	@keyframes settle {
		from {
			opacity: 0;
			transform: scale(1.04);
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(var(--rise));
		}
	}
	@media (max-width: 900px) {
		.stage {
			grid-template-columns: minmax(0, 1fr);
		}
		.intro,
		.ranks {
			grid-column: 1;
		}
		.marker {
			display: none;
		}
		.feature {
			display: none;
		}
		.row {
			padding-inline: 8px;
		}
		.row.on {
			background: var(--color-ink);
			color: var(--color-bg);
		}
		.row.on .rank {
			color: var(--color-accent-200);
		}
		.inline {
			display: grid;
			grid-template-columns: 96px 1fr;
			gap: 16px;
			padding: 16px 8px 24px;
			margin-bottom: 8px;
			background: var(--color-surface);
			font-size: var(--text-body);
		}
		.inline img {
			width: 96px;
			aspect-ratio: 2 / 3;
			object-fit: cover;
		}
		.inline-text {
			display: grid;
			align-content: start;
			gap: 6px;
		}
	}
</style>
