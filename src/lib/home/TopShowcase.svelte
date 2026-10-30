<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { RankedMedia } from '../rank';
	import { reveal } from '../actions/reveal';
	import AiringBadge from '../components/AiringBadge.svelte';
	import SaveButton from '../components/SaveButton.svelte';
	import { inkOn } from '../color';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	let { items }: { items: RankedMedia[] } = $props();

	const ranked = $derived(items.slice(0, 10));
	let picked = $state(0);
	const current = $derived(ranked[Math.min(picked, ranked.length - 1)]);

	// arrow keys walk the ranks, like a list box
	let list: HTMLOListElement;
	function onkeydown(event: KeyboardEvent) {
		const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		picked = (picked + step + ranked.length) % ranked.length;
		list.querySelectorAll<HTMLButtonElement>('.row')[picked]?.focus();
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

	<div class="stage page">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ol class="ranks" bind:this={list} {onkeydown}>
			{#each ranked as media, i (media.id)}
				<li>
					<button
						type="button"
						class="row"
						class:on={i === picked}
						aria-current={i === picked ? 'true' : undefined}
						aria-controls="top-feature"
						onclick={() => (picked = i)}
					>
						<span class="rank tabular">{i + 1}</span>
						<span class="title">{displayTitle(media.title ?? {})}</span>
						<span class="score tabular">{score(media)}</span>
					</button>
					{#if i === picked}
						<div class="inline">
							{#if media.coverImage?.large}
								<img src={media.coverImage.large} alt="" width="230" height="345" loading="lazy" />
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
</section>

<style>
	.intro {
		display: grid;
		gap: var(--space-1);
		padding-block: var(--section) var(--space-4);
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
		column-gap: var(--gutter);
		align-items: start;
		padding-bottom: var(--section);
	}
	.ranks {
		grid-column: 1 / 6;
		display: grid;
		gap: 2px;
		list-style: none;
		letter-spacing: -0.01em;
	}
	.row {
		display: grid;
		grid-template-columns: 2.2ch 1fr auto;
		align-items: baseline;
		gap: var(--space-2);
		width: 100%;
		padding: 10px 12px;
		text-align: left;
		color: var(--color-muted);
		transition:
			background-color var(--t-ui) ease,
			color var(--t-ui) ease;
	}
	.row.on {
		background: var(--color-surface);
		color: var(--color-ink);
		font-weight: 700;
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
	/* a pick swaps the card: the banner settles, the poster and the words follow it */
	@media (prefers-reduced-motion: no-preference) {
		.banner {
			animation: settle 700ms var(--ease-expo) both;
		}
		.poster,
		.info > * {
			animation: rise 500ms var(--ease-expo) both;
		}
		.poster {
			animation-delay: 40ms;
		}
		.info > :nth-child(2) {
			animation-delay: 60ms;
		}
		.info > :nth-child(3) {
			animation-delay: 100ms;
		}
		.info > :nth-child(n + 4) {
			animation-delay: 140ms;
		}
	}
	@keyframes settle {
		from {
			opacity: 0;
			transform: scale(1.06);
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	@media (max-width: 900px) {
		.stage {
			grid-template-columns: minmax(0, 1fr);
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
