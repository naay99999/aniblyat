<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { RankedMedia } from '../rank';
	import { pinProgressAction } from '../actions/pin-progress';
	import { reveal } from '../actions/reveal';
	import AiringBadge from '../components/AiringBadge.svelte';
	import SaveButton from '../components/SaveButton.svelte';
	import { inkOn } from '../color';
	import { animePath } from '../paths';
	import { activeIndex } from '../scroll';
	import { displayTitle } from '../text';

	let { items }: { items: RankedMedia[] } = $props();

	const ranked = $derived(items.slice(0, 10));
	let picked = $state(0);
	const current = $derived(ranked[Math.min(picked, ranked.length - 1)]);

	// wide screens with motion pin the stage and let the scroll walk the ranks
	let pinned = $state(false);
	$effect(() => {
		const query = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
		const sync = () => (pinned = query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	let wrap: HTMLElement;
	function choose(i: number) {
		if (!pinned) {
			picked = i;
			return;
		}
		const rect = wrap.getBoundingClientRect();
		const travel = rect.height - window.innerHeight;
		const top = window.scrollY + rect.top + (travel * (i + 0.5)) / ranked.length;
		window.scrollTo({ top, behavior: 'smooth' });
	}

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
	<header class="intro page">
		<h2 id="top-title" use:reveal>{m.home_top_title()}</h2>
		<p use:reveal={1}>{m.home_top_lead()}</p>
	</header>

	<div
		class="wrap"
		class:pinned
		bind:this={wrap}
		style:--count={ranked.length}
		use:pinProgressAction={(p) => {
			if (pinned) picked = activeIndex(p, ranked.length);
		}}
	>
		<div class="stage page">
			<ol class="ranks">
				{#each ranked as media, i (media.id)}
					<li use:reveal={i}>
						<button
							type="button"
							class="row"
							class:on={i === picked}
							aria-current={i === picked ? 'true' : undefined}
							aria-controls="top-feature"
							onclick={() => choose(i)}
						>
							<span class="rank tabular">{i + 1}</span>
							<span class="title">{displayTitle(media.title ?? {})}</span>
							<span class="score tabular">{score(media)}</span>
						</button>
						{#if i === picked}
							<div class="inline">
								{#if media.coverImage?.large}
									<img
										src={media.coverImage.large}
										alt=""
										width="230"
										height="345"
										loading="lazy"
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
					style:background-color={ground ?? 'var(--color-ink)'}
					style:color={ground ? inkOn(ground) : 'var(--color-bg)'}
					aria-live="polite"
				>
					{#key current.id}
						<div class="feature-body">
							{#if current.bannerImage}
								<img class="banner" src={current.bannerImage} alt="" width="1900" height="400" />
							{/if}
							<div class="detail">
								{#if current.coverImage?.extraLarge ?? current.coverImage?.large}
									<a href={animePath(current.id)} class="poster" tabindex="-1" aria-hidden="true">
										<img
											src={current.coverImage?.extraLarge ?? current.coverImage?.large}
											alt=""
											width="460"
											height="690"
										/>
									</a>
								{/if}
								<div class="info">
									<p class="place tabular">{m.home_top_rank({ rank: String(picked + 1) })}</p>
									<h3 class="name">
										<a href={animePath(current.id)} class="link"
											>{displayTitle(current.title ?? {})}</a
										>
									</h3>
									<p class="facts">{facts(current)}</p>
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
		</div>
	</div>
</section>

<style>
	.intro {
		display: grid;
		gap: 12px;
		padding-block: 160px 48px;
	}
	.intro h2 {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.intro p {
		max-width: 52ch;
	}
	.wrap.pinned {
		height: calc(100svh + var(--count) * 25svh);
	}
	.stage {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: center;
		padding-bottom: 160px;
	}
	.pinned .stage {
		position: sticky;
		top: 0;
		height: 100svh;
		padding-block: 48px;
	}
	.ranks {
		grid-column: 1 / 6;
		list-style: none;
		font-size: var(--text-lead);
		letter-spacing: -0.02em;
	}
	.row {
		display: grid;
		grid-template-columns: 2.2ch 1fr auto;
		align-items: baseline;
		gap: 16px;
		width: 100%;
		padding: 0.32em 12px;
		text-align: left;
		color: var(--color-muted);
		transition:
			background-color var(--t-ui) ease,
			color var(--t-ui) ease;
	}
	.row.on {
		background: var(--color-surface);
		color: var(--color-ink);
		font-weight: 800;
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
		overflow: hidden;
		transition:
			background-color 600ms var(--ease-in-out),
			color 400ms ease;
	}
	.banner {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 1;
		object-fit: cover;
	}
	.detail {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		gap: 32px;
		padding: 32px;
	}
	.poster img {
		width: 100%;
		aspect-ratio: 2 / 3;
		object-fit: cover;
	}
	.info {
		display: grid;
		align-content: start;
		gap: 12px;
	}
	.place,
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
		margin-block: 8px;
		font-size: clamp(2.5rem, 1.6rem + 3.6vw, 5.5rem);
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
		gap: 8px;
		margin-top: 12px;
	}
	@media (prefers-reduced-motion: no-preference) {
		.feature-body {
			animation: swap 600ms var(--ease-expo) both;
		}
	}
	@keyframes swap {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
	}
	@media (max-width: 900px) {
		.intro {
			padding-block: 96px 32px;
		}
		.stage {
			grid-template-columns: minmax(0, 1fr);
			padding-bottom: 96px;
		}
		.ranks {
			grid-column: 1;
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
