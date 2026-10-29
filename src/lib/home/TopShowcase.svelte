<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { RankedMedia } from '../rank';
	import { reveal } from '../actions/reveal';
	import AiringBadge from '../components/AiringBadge.svelte';
	import SaveButton from '../components/SaveButton.svelte';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	let { items }: { items: RankedMedia[] } = $props();

	const podium = $derived(items.slice(0, 3));
	const rest = $derived(items.slice(3, 10));
	const facts = (media: RankedMedia) =>
		[media.format?.replace('_', ' '), ...(media.genres ?? []).slice(0, 2)]
			.filter(Boolean)
			.join(' · ');
</script>

<section class="top" aria-labelledby="top-title">
	<header class="intro page">
		<h2 id="top-title" use:reveal>{m.home_top_title()}</h2>
		<p use:reveal={1}>{m.home_top_lead()}</p>
	</header>
	{#each podium as media, i (media.id)}
		{@const title = displayTitle(media.title ?? {})}
		{@const wide = media.bannerImage ?? media.coverImage?.extraLarge}
		<article
			class="frame"
			style:background-color={media.coverImage?.color ?? 'var(--color-surface)'}
		>
			{#if wide}
				<img class="wide" src={wide} alt="" fetchpriority="low" width="1900" height="400" />
			{/if}
			<div class="card" style:--col={i + 2} use:reveal>
				<h3 class="name"><a href={animePath(media.id)} class="link">{title}</a></h3>
				<p class="facts">{m.home_top_rank({ rank: String(i + 1) })} · {facts(media)}</p>
				<p class="facts">
					{media.unscored
						? m.unscored()
						: m.home_top_score({ score: String(media.averageScore ?? '') })}
				</p>
				{#if media.coverImage?.large}
					<a href={animePath(media.id)} class="thumb" tabindex="-1" aria-hidden="true">
						<img src={media.coverImage.large} alt="" loading="lazy" width="230" height="345" />
					</a>
				{/if}
				<p class="facts"><AiringBadge {media} /></p>
				<div class="save">
					<SaveButton
						item={{ id: media.id, title, cover: media.coverImage?.large ?? null }}
						variant="button"
					/>
				</div>
			</div>
		</article>
	{/each}

	{#if rest.length}
		<div class="rest page">
			<h3 class="rest-title" use:reveal>{m.home_top_rest()}</h3>
			<ol start="4">
				{#each rest as media, i (media.id)}
					<li use:reveal={i}>
						<a href={animePath(media.id)} class="row">
							<span class="title">{displayTitle(media.title ?? {})}</span>
							<span class="soft tabular">
								{media.unscored ? m.unscored() : media.averageScore}
							</span>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</section>

<style>
	.frame {
		position: relative;
		overflow: hidden;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: start;
		padding-block: 22svh 8svh;
		padding-inline: var(--gutter);
		column-gap: var(--gutter);
	}
	.wide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: min(48svh, 26vw);
		object-fit: cover;
	}
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.wide {
				animation: drift linear both;
				animation-timeline: view();
				animation-range: entry 0% exit 100%;
			}
			@keyframes drift {
				from {
					transform: scale(1.08) translateY(-3%);
				}
				to {
					transform: scale(1.08) translateY(3%);
				}
			}
		}
	}
	.card {
		position: relative;
		grid-column: var(--col);
		display: grid;
		gap: 10px;
		align-content: start;
		min-height: 52svh;
		padding: 24px;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.intro {
		display: grid;
		gap: 12px;
		padding-block: 160px 64px;
	}
	.intro h2 {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.name {
		font-size: var(--text-lead);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.facts {
		font-size: var(--text-small);
		color: #c9c4bc;
	}
	.facts :global(span) {
		color: inherit;
	}
	.thumb {
		width: 96px;
		aspect-ratio: 2 / 3;
		overflow: hidden;
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.save {
		margin-top: auto;
		padding-top: 8px;
	}
	.save :global(.btn) {
		width: 100%;
	}
	.rest {
		padding-block: 120px;
	}
	.rest-title {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		margin-bottom: 40px;
	}
	ol {
		list-style: none;
		counter-reset: rank 3;
		font-size: var(--text-lead);
		letter-spacing: -0.02em;
	}
	li {
		counter-increment: rank;
	}
	.row {
		display: grid;
		grid-template-columns: 3ch 1fr auto;
		gap: 16px;
		padding-block: 0.25em;
		transition: color var(--t-hover) ease;
	}
	.row::before {
		content: counter(rank);
		color: var(--color-accent-text);
		font-variant-numeric: tabular-nums;
	}
	@media (hover: hover) and (pointer: fine) {
		.row:hover .title {
			text-decoration: underline;
			text-underline-offset: 0.15em;
			text-decoration-thickness: 0.06em;
		}
	}
	.soft {
		color: var(--color-muted);
	}
	@media (max-width: 900px) {
		.frame {
			grid-template-columns: 1fr;
			align-items: end;
			padding: 0;
			min-height: 0;
		}
		.wide {
			position: static;
			height: 44vw;
		}
		.card {
			grid-column: 1;
			min-height: 46svh;
			margin: 0;
		}
	}
</style>
