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
	import TrailerLoop from '#lib/components/TrailerLoop.svelte';
	import SaveButton from '#lib/components/SaveButton.svelte';
	import { heroGround, inkOn } from '#lib/color.js';
	import { animePath, homePath, seasonHref } from '#lib/paths.js';
	import { seasonLabel } from '#lib/season.js';
	import { displayTitle, formatLabel, headSize, stripHtml } from '#lib/text.js';
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
	const ground = $derived(heroGround(media?.coverImage?.color));
	const ink = $derived(inkOn(ground));
	// the hero's picture: the wide banner, or the whole cover for a title without one
	const art = $derived(media?.coverImage?.extraLarge ?? null);
	const status = $derived(media ? airingStatus(media, clock.now) : null);
	const titleSize = $derived(headSize(title));
	// a second title line is only worth showing when it says something the headline doesn't
	const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
	const altTitles = $derived(
		media?.title
			? [media.title.romaji, media.title.native].filter(
					(t): t is string => !!t && norm(t) !== norm(title)
				)
			: []
	);
	const WALL_LIMIT = 12;
	let showAllRelated = $state(false);
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
					formatLabel(media.format),
					media.episodes ? m.detail_episode_count({ count: String(media.episodes) }) : null,
					media.duration ? m.detail_duration_value({ minutes: String(media.duration) }) : null,
					studios
				].filter(Boolean)
			: []
	);

	const facts = $derived.by(() => {
		if (!media) return [];
		const rows: [string, string | null][] = [
			[m.detail_format(), formatLabel(media.format) ?? null],
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
	// a few relations read as a short list; many get a wall of posters
	const fewRelated = $derived(related.length > 0 && related.length <= 3);
	// a long synopsis steps down from lead to body size so it stays a comfortable read
	const longSynopsis = $derived((synopsis?.length ?? 0) > 700);
</script>

<svelte:head><title>{title ? `${title} · aniblyat` : 'aniblyat'}</title></svelte:head>

{#snippet waiting()}
	<!-- the hero's own shape while AniList answers, so the page doesn't jump when it does -->
	<section class="hero page waiting" role="status" aria-label={m.loading()}>
		<div class="sheet">
			<span class="line-block short block"></span>
			<div class="words">
				<span class="title-block block"></span>
				<span class="title-block shorter block"></span>
			</div>
			<div class="foot"><span class="action-block block"></span></div>
		</div>
		<div class="art"><span class="art-block block"></span></div>
	</section>
{/snippet}

{#snippet relatedList(kind: 'rows' | 'wall', items: typeof related)}
	<ul class={kind} use:reveal={1}>
		{#each items as rel (rel.node.id)}
			<li>
				<a href={animePath(rel.node.id)} class="rel">
					<span class="thumb">
						{#if rel.node.coverImage?.extraLarge ?? rel.node.coverImage?.large}
							<img
								src={rel.node.coverImage?.extraLarge ?? rel.node.coverImage?.large}
								alt=""
								width="460"
								height="690"
								loading="lazy"
							/>
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
		<section class="page capped missing">
			<h1>{m.not_found_anime()}</h1>
			<a href={homePath()} class="btn">{m.back_home()}</a>
		</section>
	{:else}
		<article>
			<!--
			 the poster: a sheet of type on the cover's own deep hue, and the cover itself as a hard-edged
			 panel at the right. The title is the head; everything else is set small around it.
			-->
			<section
				class="hero page"
				class:no-art={!art}
				style:background-color={ground}
				style:color={ink}
				style:--hero-ink={ink}
				style:--hero-ground={ground}
				use:barTint={{ bg: ground, ink }}
				aria-labelledby="anime-title"
			>
				<div class="sheet">
					<p class="kicker">
						{#if media.season && media.seasonYear}
							<a
								class="link season"
								href={seasonHref({ season: media.season, year: media.seasonYear })}
								>{seasonLabel({ season: media.season, year: media.seasonYear })}</a
							>
						{/if}
						{#each glance as item (item)}<span>{item}</span>{/each}
					</p>

					<header class="words">
						<h1 id="anime-title" class="poster-head t-{titleSize}">{title}</h1>
						{#each altTitles as alt (alt)}
							<p class="alt" lang={alt === media.title?.native ? 'ja' : undefined}>{alt}</p>
						{/each}
						{#if media.genres?.length}
							<p class="genres">
								<span class="sr-only">{m.detail_genres()}:</span>
								{media.genres.join(' · ')}
							</p>
						{/if}
					</header>

					<div class="foot">
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
							</div>
						</div>

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
					</div>
				</div>

				{#if art}
					<div class="art">
						<img
							src={art}
							alt={title}
							width="460"
							height="690"
							fetchpriority="high"
							style:view-transition-name="cover"
						/>
					</div>
				{/if}
			</section>

			<!-- the banner keeps its own wide band under the hero, where it shows whole -->
			{#if media.bannerImage || trailerId}
				<div class="band" class:moving={trailerId} style:background-color={ground}>
					{#if media.bannerImage}
						<img src={media.bannerImage} alt="" width="1900" height="400" />
					{/if}
					{#if trailerId}<TrailerLoop id={trailerId} {title} />{/if}
				</div>
			{/if}

			<!-- the body reads as rows of an editorial page: a heavy rule, the head at left, the matter at right -->
			<div class="page capped body">
				{#if synopsis}
					<section class="chapter" aria-labelledby="synopsis-title">
						<h2 id="synopsis-title" class="chapter-head holds" use:reveal>{m.detail_synopsis()}</h2>
						<div class="chapter-matter">
							<!-- pre-line keeps AniList's paragraph breaks, so no whitespace around the text -->
							<!-- prettier-ignore -->
							<p class="synopsis" class:long={longSynopsis} lang="en" use:reveal={1}>{synopsis}</p>
						</div>
					</section>
				{/if}

				<section class="chapter" aria-labelledby="facts-title">
					<h2 id="facts-title" class="chapter-head holds" use:reveal>{m.detail_facts()}</h2>
					<div class="chapter-matter">
						<dl class="facts" use:reveal={1}>
							{#each facts as [label, value] (label)}
								<div class="hairline">
									<dt>{label}</dt>
									<dd class="tabular">{value}</dd>
								</div>
							{/each}
						</dl>
					</div>
				</section>

				{#if trailerId}
					<section id="trailer" class="chapter" aria-labelledby="trailer-title">
						<h2 id="trailer-title" class="chapter-head holds" use:reveal>{m.detail_trailer()}</h2>
						<div class="chapter-matter">
							<div class="frame" use:reveal={1}>
								<iframe
									src="https://www.youtube-nocookie.com/embed/{trailerId}"
									title="{m.detail_trailer()} · {title}"
									loading="lazy"
									allow="encrypted-media; picture-in-picture; fullscreen"
								></iframe>
							</div>
						</div>
					</section>
				{/if}

				{#if related.length}
					<section class="chapter" aria-labelledby="related-title">
						<h2 id="related-title" class="chapter-head holds" use:reveal>{m.detail_related()}</h2>
						<div class="chapter-matter">
							{#if fewRelated}
								{@render relatedList('rows', related)}
							{:else}
								{@render relatedList(
									'wall',
									showAllRelated ? related : related.slice(0, WALL_LIMIT)
								)}
								{#if related.length > WALL_LIMIT && !showAllRelated}
									<button
										type="button"
										class="btn btn-ink more-rel"
										aria-expanded={showAllRelated}
										onclick={() => (showAllRelated = true)}
									>
										{m.detail_related_all({ count: String(related.length) })}
									</button>
								{/if}
							{/if}
						</div>
					</section>
				{/if}
			</div>
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

	/* ---- the poster ---- */
	.hero {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		min-height: min(100svh, 920px);
		margin-top: calc(-1 * var(--nav-h));
		padding-top: var(--nav-h);
	}
	.sheet {
		grid-column: 1 / 8;
		grid-row: 1;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		row-gap: var(--space-4);
		padding-block: var(--space-3) var(--space-4);
	}
	.no-art .sheet {
		grid-column: 1 / -1;
	}

	/* small type around the head, in fixed runs rather than a dotted sentence */
	.kicker {
		display: flex;
		flex-wrap: wrap;
		gap: 4px var(--space-3);
		font-size: var(--text-small);
		font-weight: 600;
	}
	.season {
		text-decoration-color: currentColor;
	}

	.words {
		display: grid;
		gap: var(--space-2);
		align-content: center;
	}
	.alt {
		max-width: 48ch;
		font-size: var(--text-body);
		font-weight: 500;
		opacity: 0.78;
	}
	.genres {
		margin-top: var(--space-1);
		font-size: var(--text-small);
		font-weight: 600;
	}

	/* the foot of the poster: one heavy rule, the clock at left, the score as a second, smaller head */
	.foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		column-gap: var(--space-4);
		row-gap: var(--space-3);
		align-items: end;
		padding-top: var(--space-3);
		border-top: 3px solid currentColor;
		--countdown-size: clamp(1.75rem, 0.8rem + 2.2vw, 3rem);
	}
	.now {
		display: grid;
		gap: var(--space-2);
		max-width: 560px;
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
		gap: 12px var(--space-3);
		margin-top: var(--space-1);
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
	/* the cover's colour can be teal; the ring follows the ink instead */
	.hero :global(:focus-visible) {
		outline-color: var(--hero-ink);
	}
	.more {
		font-weight: 600;
		text-decoration-color: currentColor;
	}
	.rating {
		text-align: right;
	}
	.score {
		font-size: clamp(4rem, 2rem + 5vw, 7.5rem);
		font-weight: 800;
		letter-spacing: -0.06em;
		line-height: 0.8;
	}
	.score.opening {
		font-size: clamp(2.25rem, 1.4rem + 2.6vw, 4rem);
		letter-spacing: -0.04em;
	}
	.score span {
		font-size: 0.22em;
		letter-spacing: -0.02em;
		margin-left: 0.1em;
	}
	.note {
		margin-top: var(--space-1);
		font-size: var(--text-small);
		font-weight: 600;
	}

	/* the cover as a hard-edged panel, bled off the top, right and bottom edges */
	.art {
		position: relative;
		grid-column: 8 / -1;
		grid-row: 1;
		margin-right: calc(-1 * var(--gutter));
		min-height: 0;
		overflow: hidden;
	}
	.art img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 20%;
	}
	@media (prefers-reduced-motion: no-preference) {
		.kicker,
		.words,
		.foot,
		.art img {
			animation: arrive var(--t-scene) var(--ease-out) both;
		}
		.words {
			animation-delay: 60ms;
		}
		.foot {
			animation-delay: 120ms;
		}
		.art img {
			animation-name: unveil;
		}
		/* the picked cover is already flying into place */
		:global(html.vt-cover) .art img {
			animation: none;
		}
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(var(--rise));
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
		width: 86%;
		height: 0.8em;
		font-size: clamp(2.75rem, 1rem + 5.4vw, 6.5rem);
	}
	.title-block.shorter {
		width: 52%;
	}
	.line-block {
		width: 40%;
		height: 1.2em;
	}
	.action-block {
		width: 140px;
		height: 44px;
	}
	.art-block {
		position: absolute;
		inset: 0;
		opacity: 0.6;
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
		position: relative;
		overflow: hidden;
		aspect-ratio: 4 / 1;
		max-height: 48svh;
		width: 100%;
	}
	.band img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* on a phone a wide band would leave the clip a sliver */
	@media (max-width: 720px) {
		.band.moving {
			aspect-ratio: 16 / 9;
		}
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

	/* ---- the editorial body ---- */
	.body {
		display: grid;
		row-gap: var(--section);
		padding-block: var(--section);
	}
	.synopsis {
		max-width: 36em;
		font-size: var(--text-lead);
		line-height: 1.45;
		letter-spacing: -0.015em;
		white-space: pre-line;
	}
	.synopsis.long {
		max-width: 64ch;
		font-size: var(--text-body);
		line-height: 1.6;
	}

	/* facts as a two-column table of hairlines: no boxes, only the rules a timetable needs */
	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: var(--gutter);
	}
	.facts div {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		gap: var(--space-2);
		align-items: baseline;
		padding-block: 14px;
	}
	dt {
		font-size: var(--text-small);
		font-weight: 600;
		color: var(--color-muted);
	}
	dd {
		font-weight: 600;
	}

	.frame {
		aspect-ratio: 16 / 9;
		background: var(--color-ink);
	}
	.frame iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}

	.wall {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
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
		list-style: none;
	}
	.rows .rel {
		grid-template-columns: 72px 1fr;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-2);
		border-bottom: 1px solid var(--hairline);
	}
	.rows li:first-child .rel {
		padding-top: 0;
	}
	.rows .rel-title {
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.2;
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
		transition: transform var(--t-move) var(--ease-out);
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
		color: var(--color-muted);
		font-weight: 600;
	}
	.rel-title {
		font-weight: 600;
		line-height: 1.45;
	}
	.more-rel {
		margin-top: var(--space-5);
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
			/* the cover leads edge to edge, then the sheet of type under it */
			grid-template-columns: minmax(0, 1fr);
			min-height: 0;
		}
		.sheet,
		.no-art .sheet {
			grid-column: 1;
			grid-row: 2;
			row-gap: var(--space-3);
			padding-block: var(--space-3) var(--space-4);
		}
		.art {
			grid-column: 1;
			grid-row: 1;
			margin-inline: calc(-1 * var(--gutter));
			aspect-ratio: 4 / 5;
			max-height: 62svh;
		}
		.no-art .sheet {
			grid-row: 1;
		}
		.foot {
			grid-template-columns: minmax(0, 1fr);
			--countdown-size: clamp(1.75rem, 8vw, 2.75rem);
		}
		/* the clock still comes first; the score follows under a hairline */
		.rating {
			text-align: left;
			padding-top: var(--space-3);
			border-top: 1px solid color-mix(in srgb, currentColor 30%, transparent);
		}
		.now {
			max-width: none;
		}
		.facts {
			grid-template-columns: minmax(0, 1fr);
		}
		.wall {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 24px 12px;
		}
	}
</style>
