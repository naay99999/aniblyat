<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import { barTint } from '../actions/bar-tint';
	import { pinProgressAction } from '../actions/pin-progress';
	import { airingStatus, formatAirTime } from '../airing';
	import AiringBadge from '../components/AiringBadge.svelte';
	import Countdown from '../components/Countdown.svelte';
	import { clock } from '../clock.svelte';
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
	const status = $derived(active ? airingStatus(active, clock.now) : null);

	let section: HTMLElement;

	// jump the pinned stage to one title; the scroll position stays the single source of truth
	function jump(i: number) {
		const rect = section.getBoundingClientRect();
		const travel = rect.height - window.innerHeight;
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({
			top: window.scrollY + rect.top + (travel * (i + 0.5)) / panels.length,
			behavior: reduce ? 'auto' : 'smooth'
		});
	}
</script>

<section
	class="hero"
	bind:this={section}
	style:--panels={Math.max(panels.length, 1)}
	use:pinProgressAction={(p) => (progress = p)}
	use:barTint={{ bg: ground ?? 'var(--color-bg)', ink }}
	aria-labelledby="hero-title"
>
	<div class="stage" style:background-color={ground ?? 'var(--color-bg)'} style:color={ink}>
		<div class="words">
			<h1 id="hero-title" class="title display">{seasonLabel(season)}</h1>
			<p class="lead">{m.home_title({ season: seasonLabel(season) })}</p>
			{#if panels.length > 1}
				<ul class="steps" aria-label={m.home_trending_caption()}>
					{#each panels as media, i (media.id)}
						<li>
							<button
								type="button"
								class="step"
								class:on={i === index}
								aria-current={i === index ? 'true' : undefined}
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
	.step.on {
		opacity: 1;
		background: color-mix(in srgb, currentColor 10%, transparent);
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
		.cover,
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
