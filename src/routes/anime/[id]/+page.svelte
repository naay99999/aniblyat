<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { barTint } from '#lib/actions/bar-tint.js';
	import { reveal } from '#lib/actions/reveal.js';
	import { airingStatus, formatAirTime, formatFuzzyDate, statusLabel } from '#lib/airing.js';
	import { getMedia } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import { clock } from '#lib/clock.svelte.js';
	import Countdown from '#lib/components/Countdown.svelte';
	import QueryState from '#lib/components/QueryState.svelte';
	import SaveButton from '#lib/components/SaveButton.svelte';
	import { inkOn } from '#lib/color.js';
	import { animePath, homePath, seasonHref } from '#lib/paths.js';
	import { displayTitle, stripHtml } from '#lib/text.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const query = createQuery(() => ({
		queryKey: ['media', data.id],
		queryFn: () => getMedia(data.id),
		initialData: data.initial ? data.initial.media : undefined,
		initialDataUpdatedAt: data.initial?.fetchedAt
	}));
	useAiringInvalidation(
		() => ['media', data.id],
		() => query.data
	);

	const media = $derived(query.data);
	const title = $derived(media ? displayTitle(media.title ?? {}) : '');
	const ground = $derived(media?.coverImage?.color ?? null);
	const ink = $derived(inkOn(ground));
	const status = $derived(media ? airingStatus(media, clock.now) : null);
	// the headline steps down as the title grows, so it holds to two lines
	const titleSize = $derived(
		title.length <= 22 ? 'xl' : title.length <= 48 ? 'l' : title.length <= 70 ? 'm' : 's'
	);
	const related = $derived(
		(media?.relations?.edges ?? []).flatMap((e) =>
			e?.node && e.node.type === 'ANIME' ? [{ type: e.relationType, node: e.node }] : []
		)
	);
	const relLabels: Record<string, () => string> = {
		PREQUEL: m.rel_PREQUEL,
		SEQUEL: m.rel_SEQUEL,
		SIDE_STORY: m.rel_SIDE_STORY,
		SPIN_OFF: m.rel_SPIN_OFF,
		PARENT: m.rel_PARENT,
		ALTERNATIVE: m.rel_ALTERNATIVE,
		CHARACTER: m.rel_CHARACTER,
		SUMMARY: m.rel_SUMMARY,
		COMPILATION: m.rel_COMPILATION,
		CONTAINS: m.rel_CONTAINS,
		OTHER: m.rel_OTHER
	};
	const relLabel = (t: string | null | undefined) =>
		t ? (relLabels[t]?.() ?? t.replace(/_/g, ' ').toLowerCase()) : '';
	const titleCase = (s: string | null | undefined) =>
		s
			? s
					.replace(/_/g, ' ')
					.toLowerCase()
					.replace(/^\w/, (c) => c.toUpperCase())
			: null;
	const studios = $derived(
		media?.studios?.nodes
			?.map((s) => s?.name)
			.filter(Boolean)
			.join(', ') || null
	);

	// the short line under the title: what it is, at a glance
	const glance = $derived(
		media
			? [
					media.format?.replace('_', ' '),
					media.episodes ? m.detail_episode_count({ count: String(media.episodes) }) : null,
					media.duration ? m.detail_duration_value({ minutes: String(media.duration) }) : null,
					studios
				].filter(Boolean)
			: []
	);

	const facts = $derived.by(() => {
		if (!media) return [];
		const rows: [string, string | null][] = [
			[m.detail_format(), media.format?.replace('_', ' ') ?? null],
			[m.detail_episodes(), media.episodes ? String(media.episodes) : null],
			[
				m.detail_duration(),
				media.duration ? m.detail_duration_value({ minutes: String(media.duration) }) : null
			],
			[m.detail_source(), titleCase(media.source)],
			[m.detail_studio(), studios],
			[m.detail_start(), formatFuzzyDate(media.startDate ?? null)],
			[m.detail_end(), formatFuzzyDate(media.endDate ?? null)],
			[
				m.detail_popularity(),
				media.popularity != null ? media.popularity.toLocaleString('en-US') : null
			]
		];
		return rows.filter((r): r is [string, string] => r[1] != null);
	});
	const trailerId = $derived(
		media?.trailer?.site === 'youtube' && media.trailer.id ? media.trailer.id : null
	);
	const synopsis = $derived(media?.description ? stripHtml(media.description) : null);
	// a title not yet scored leads with the date it starts instead
	const opening = $derived(
		media?.averageScore == null && status?.kind === 'upcoming'
			? formatFuzzyDate(status.startDate)
			: null
	);
	// a few relations read as a short list beside the facts; many get their own wall
	const fewRelated = $derived(related.length > 0 && related.length <= 3);
</script>

<svelte:head><title>{title ? `${title} · aniblyat` : 'aniblyat'}</title></svelte:head>

{#snippet waiting()}
	<!-- the hero's own shape while AniList answers, so the page doesn't jump when it does -->
	<section class="hero page waiting" role="status" aria-label={m.loading()}>
		<div class="words">
			<span class="title-block block"></span>
			<span class="line-block block"></span>
			<span class="line-block short block"></span>
		</div>
		<div class="now"><span class="action-block block"></span></div>
		<div class="poster"><span class="poster-block block"></span></div>
	</section>
{/snippet}

{#snippet relatedList(kind: 'rows' | 'wall')}
	<ul class={kind}>
		{#each related as rel, i (rel.node.id)}
			<li use:reveal={i % 6}>
				<a href={animePath(rel.node.id)} class="rel">
					<span class="thumb">
						{#if rel.node.coverImage?.large}
							<img src={rel.node.coverImage.large} alt="" width="230" height="345" loading="lazy" />
						{/if}
					</span>
					<span class="rel-text">
						<span class="rel-type">{relLabel(rel.type)}</span>
						<span class="rel-title">{displayTitle(rel.node.title ?? {})}</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
{/snippet}

<QueryState {query} inset pending={waiting}>
	{#if !media}
		<section class="page missing">
			<h1>{m.not_found_anime()}</h1>
			<a href={homePath()} class="btn">{m.back_home()}</a>
		</section>
	{:else}
		<article>
			<section
				class="hero page"
				class:no-poster={!media.coverImage?.extraLarge}
				style:background-color={ground ?? 'var(--color-surface)'}
				style:color={ink}
				style:--hero-ink={ink}
				style:--hero-ground={ground ?? 'var(--color-surface)'}
				use:barTint={{ bg: ground ?? 'var(--color-surface)', ink }}
				aria-labelledby="anime-title"
			>
				<header class="words">
					<h1 id="anime-title" class="title t-{titleSize}">{title}</h1>
					{#if media.title?.romaji && media.title.romaji !== title}
						<p class="alt">{media.title.romaji}</p>
					{/if}
					{#if media.title?.native}<p class="alt" lang="ja">{media.title.native}</p>{/if}
					{#if glance.length}<p class="glance">{glance.join(' · ')}</p>{/if}
					{#if media.genres?.length}
						<p class="genres">
							<span class="sr-only">{m.detail_genres()}:</span>
							{media.genres.join(' · ')}
						</p>
					{/if}
				</header>

				{#if media.averageScore != null}
					<div class="rating">
						<p class="score tabular">{media.averageScore}<span>/100</span></p>
						<p class="note">{m.detail_score_note()}</p>
					</div>
				{:else if opening}
					<div class="rating">
						<p class="score opening">{opening}</p>
						<p class="note">{m.detail_start()}</p>
					</div>
				{/if}

				<div class="now">
					{#if status?.kind === 'next'}
						<p class="airs">
							{m.home_hero_airs({
								episode: String(status.episode),
								time: formatAirTime(status.airingAt)
							})}
						</p>
						<Countdown airingAt={status.airingAt} />
					{:else if status && !opening}
						<p class="state">{statusLabel(status)}</p>
					{/if}
					<div class="actions">
						<SaveButton
							item={{ id: media.id, title, cover: media.coverImage?.large ?? null }}
							variant="button"
						/>
						{#if trailerId}
							<a href="#trailer" class="link more">{m.detail_watch_trailer()}</a>
						{/if}
						{#if media.season && media.seasonYear}
							<a
								class="link more"
								href={seasonHref({ season: media.season, year: media.seasonYear })}
								>{titleCase(media.season)} {media.seasonYear}</a
							>
						{/if}
					</div>
				</div>

				{#if media.coverImage?.extraLarge}
					<div class="poster">
						<img
							src={media.coverImage.extraLarge}
							alt={title}
							width="460"
							height="690"
							fetchpriority="high"
							style:view-transition-name="cover-{media.id}"
						/>
					</div>
				{/if}
			</section>

			{#if media.bannerImage}
				<div class="band" style:background-color={ground ?? 'var(--color-surface)'}>
					<img src={media.bannerImage} alt="" width="1900" height="400" />
				</div>
			{/if}

			<div class="page body">
				{#if synopsis || fewRelated}
					<div class="lead-col">
						{#if synopsis}
							<section class="synopsis" aria-labelledby="synopsis-title">
								<h2 id="synopsis-title" use:reveal>{m.detail_synopsis()}</h2>
								<p lang="en" use:reveal={1}>{synopsis}</p>
							</section>
						{/if}
						{#if fewRelated}
							<section aria-labelledby="related-title">
								<h2 id="related-title" use:reveal>{m.detail_related()}</h2>
								{@render relatedList('rows')}
							</section>
						{/if}
					</div>
				{/if}

				<section class="info" class:alone={!synopsis && !fewRelated} aria-labelledby="facts-title">
					<h2 id="facts-title" use:reveal>{m.detail_facts()}</h2>
					<dl class="facts">
						{#each facts as [label, value], i (label)}
							<div use:reveal={i + 2}>
								<dt>{label}</dt>
								<dd class="tabular">{value}</dd>
							</div>
						{/each}
					</dl>
				</section>
			</div>

			{#if trailerId}
				<section id="trailer" class="trailer page" aria-labelledby="trailer-title">
					<h2 id="trailer-title" use:reveal>{m.detail_trailer()}</h2>
					<div class="frame" use:reveal={1}>
						<iframe
							src="https://www.youtube-nocookie.com/embed/{trailerId}"
							title="{m.detail_trailer()} · {title}"
							loading="lazy"
							allow="encrypted-media; picture-in-picture; fullscreen"
						></iframe>
					</div>
				</section>
			{/if}

			{#if related.length && !fewRelated}
				<section class="page related" aria-labelledby="related-title">
					<h2 id="related-title" use:reveal>{m.detail_related()}</h2>
					{@render relatedList('wall')}
				</section>
			{/if}
		</article>
	{/if}
</QueryState>

<style>
	.missing {
		display: grid;
		gap: 24px;
		justify-items: start;
		align-content: center;
		min-height: 60svh;
	}
	.missing h1 {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
	}

	/* the hero: the cover's own colour as the field, the poster as the picture */
	.hero {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		grid-template-rows: auto minmax(0, 1fr) auto;
		column-gap: var(--gutter);
		row-gap: 40px;
		min-height: min(100svh, 920px);
		margin-top: calc(-1 * var(--nav-h));
		padding-top: calc(var(--nav-h) + 16px);
		padding-bottom: 32px;
	}
	.words {
		grid-column: 1 / 9;
		display: grid;
		gap: 10px;
		align-content: start;
	}
	.title {
		margin-bottom: 8px;
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 0.98;
	}
	.t-xl {
		font-size: clamp(3.5rem, 1.6rem + 6vw, 8rem);
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.t-l {
		font-size: var(--text-head);
	}
	.t-m {
		font-size: var(--text-title);
	}
	.t-s {
		font-size: var(--text-lead);
	}
	.alt {
		font-size: var(--text-body);
		font-weight: 500;
		opacity: 0.8;
	}
	.glance {
		margin-top: 12px;
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.genres {
		font-weight: 600;
	}
	.rating {
		grid-column: 1 / 9;
		grid-row: 2;
		align-self: center;
	}
	.now {
		grid-column: 1 / 9;
		grid-row: 3;
		align-self: end;
		display: grid;
		gap: 20px;
		max-width: 680px;
	}
	.airs {
		font-weight: 600;
	}
	.state {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
	}
	.actions :global(.btn) {
		background: var(--hero-ink);
		color: var(--hero-ground);
	}
	@media (hover: hover) and (pointer: fine) {
		.actions :global(.btn:hover) {
			background: var(--hero-ink);
			opacity: 0.86;
		}
	}
	.more {
		font-weight: 600;
		text-decoration-color: currentColor;
	}
	.poster {
		grid-column: 9 / -1;
		grid-row: 1 / -1;
		align-self: stretch;
		min-height: 0;
	}
	/* cropped a little wider than the poster so it can hold the full height */
	.poster img {
		width: 100%;
		height: 100%;
		max-height: calc(min(100svh, 920px) - var(--nav-h) - 48px);
		aspect-ratio: 3 / 4;
		object-fit: cover;
		object-position: center top;
	}
	.no-poster .words,
	.no-poster .rating,
	.no-poster .now {
		grid-column: 1 / -1;
	}
	@media (prefers-reduced-motion: no-preference) {
		.words,
		.rating,
		.now,
		.poster img {
			animation: arrive 800ms var(--ease-expo) both;
		}
		.rating {
			animation-delay: 80ms;
		}
		.now {
			animation-delay: 160ms;
		}
		.poster img {
			animation-name: unveil;
			animation-duration: 1000ms;
		}
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
	}
	@keyframes unveil {
		from {
			clip-path: inset(100% 0 0 0);
		}
		to {
			clip-path: inset(0);
		}
	}

	.waiting {
		background: var(--color-surface);
	}
	.block {
		display: block;
		background: var(--color-bg);
	}
	.title-block {
		width: 80%;
		height: 0.9em;
		font-size: var(--text-head);
	}
	.line-block {
		width: 40%;
		height: 1.2em;
		margin-top: 8px;
	}
	.line-block.short {
		width: 26%;
	}
	.action-block {
		width: 140px;
		height: 44px;
	}
	.poster-block {
		height: 100%;
		min-height: 320px;
	}
	@media (prefers-reduced-motion: no-preference) {
		.waiting .block {
			animation: wait 1.4s ease-in-out infinite alternate;
		}
	}
	@keyframes wait {
		to {
			opacity: 0.5;
		}
	}

	.band {
		overflow: hidden;
	}
	.band img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 1;
		max-height: 48svh;
		object-fit: cover;
	}
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.band img {
				animation: drift linear both;
				animation-timeline: view();
				animation-range: entry 0% exit 100%;
			}
			@keyframes drift {
				from {
					transform: scale(1.1) translateY(-4%);
				}
				to {
					transform: scale(1.1) translateY(4%);
				}
			}
		}
	}

	.body {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		row-gap: 72px;
		padding-block: 120px 160px;
	}
	h2 {
		margin-bottom: 24px;
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.lead-col {
		grid-column: 1 / 8;
		display: grid;
		gap: 96px;
		align-content: start;
	}
	.synopsis p {
		max-width: 64ch;
		font-size: var(--text-body);
		line-height: 1.6;
		white-space: pre-line;
	}
	.info {
		grid-column: 9 / -1;
	}
	.info.alone {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: start;
	}
	.info.alone h2 {
		grid-column: 1 / -1;
	}
	.info.alone .facts {
		grid-column: 1 / 9;
	}
	.score {
		font-size: clamp(4.5rem, 2.5rem + 6vw, 8rem);
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 0.85;
	}
	.score.opening {
		font-size: clamp(3.5rem, 1.6rem + 6vw, 8rem);
		margin-top: 8px;
	}
	.score span {
		font-size: 0.25em;
		letter-spacing: -0.02em;
		margin-left: 0.1em;
	}
	.note {
		margin-top: 12px;
		font-size: var(--text-small);
		font-weight: 600;
	}
	.facts {
		display: grid;
		gap: 4px;
	}
	.facts div {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
		gap: 16px;
		padding: 12px 16px;
		background: var(--color-raised);
	}
	dt {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted);
		align-self: center;
	}
	dd {
		font-weight: 700;
	}

	.trailer {
		padding-block: 120px;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.frame {
		aspect-ratio: 16 / 9;
		max-width: 1200px;
		background: #1f1f1f;
	}
	.frame iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}

	.related {
		padding-block: 120px 160px;
	}
	.wall {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 32px var(--gutter);
		list-style: none;
	}
	.rel,
	.rel-text {
		display: grid;
		gap: 8px;
	}
	.rel-text {
		gap: 4px;
	}
	.rows {
		display: grid;
		gap: 8px;
		list-style: none;
	}
	.rows .rel {
		grid-template-columns: 96px 1fr;
		align-items: center;
		gap: 24px;
		padding: 12px;
		background: var(--color-raised);
		transition: background-color var(--t-hover) ease;
	}
	.rows .rel-title {
		font-size: var(--text-lead);
		letter-spacing: -0.02em;
	}
	@media (hover: hover) and (pointer: fine) {
		.rows .rel:hover {
			background: var(--color-surface);
		}
	}
	.thumb {
		aspect-ratio: 2 / 3;
		overflow: hidden;
		background: var(--color-surface);
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 600ms var(--ease-soft);
	}
	@media (hover: hover) and (pointer: fine) {
		.rel:hover img {
			transform: scale(1.04);
		}
		.rel:hover .rel-title {
			text-decoration: underline;
		}
	}
	.rel-type {
		font-size: var(--text-small);
		color: var(--color-accent-text);
		font-weight: 600;
	}
	.rel-title {
		font-weight: 600;
		line-height: 1.25;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	@media (max-width: 900px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto auto auto;
			row-gap: 28px;
			min-height: 0;
			padding-top: calc(var(--nav-h) + 24px);
			padding-bottom: 32px;
		}
		.words,
		.rating,
		.now,
		.poster {
			grid-column: 1;
		}
		.poster {
			grid-row: 2;
		}
		.poster img {
			max-height: 72svh;
		}
		.rating {
			grid-row: 3;
		}
		.now {
			grid-row: 4;
			max-width: none;
			--countdown-size: clamp(1.75rem, 8vw, 2.75rem);
		}
		.t-xl {
			font-size: clamp(2.75rem, 12vw, 4.5rem);
		}
		.glance {
			font-size: var(--text-body);
		}
		.body {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 72px;
			padding-block: 72px 96px;
		}
		.lead-col,
		.info,
		.info.alone {
			grid-column: 1;
		}
		.lead-col {
			gap: 72px;
		}
		.info.alone {
			display: block;
		}
		.trailer,
		.related {
			padding-block: 72px 96px;
		}
		.rows .rel {
			grid-template-columns: 72px 1fr;
			gap: 16px;
		}
		.wall {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 24px 12px;
		}
	}
</style>
