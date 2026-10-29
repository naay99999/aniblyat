<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { reveal } from '#lib/actions/reveal.js';
	import { formatFuzzyDate } from '#lib/airing.js';
	import { getMedia } from '#lib/anilist/queries.js';
	import { useAiringInvalidation } from '#lib/anilist/query-client.svelte.js';
	import AiringBadge from '#lib/components/AiringBadge.svelte';
	import QueryState from '#lib/components/QueryState.svelte';
	import SaveButton from '#lib/components/SaveButton.svelte';
	import { inkOn } from '#lib/color.js';
	import { animePath, homePath, seasonHref } from '#lib/paths.js';
	import { displayTitle, stripHtml } from '#lib/text.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const query = createQuery(() => ({
		queryKey: ['media', data.id],
		queryFn: () => getMedia(data.id)
	}));
	useAiringInvalidation(
		() => ['media', data.id],
		() => query.data
	);

	const media = $derived(query.data);
	const title = $derived(media ? displayTitle(media.title ?? {}) : '');
	const ground = $derived(media?.coverImage?.color ?? null);
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
		ALTERNATIVE: m.rel_ALTERNATIVE
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
			[
				m.detail_studio(),
				media.studios?.nodes
					?.map((s) => s?.name)
					.filter(Boolean)
					.join(', ') || null
			],
			[m.detail_start(), formatFuzzyDate(media.startDate ?? null)],
			[m.detail_end(), formatFuzzyDate(media.endDate ?? null)],
			[m.detail_score(), media.averageScore != null ? `${media.averageScore}%` : null],
			[
				m.detail_popularity(),
				media.popularity != null ? media.popularity.toLocaleString('en-US') : null
			]
		];
		return rows.filter((r): r is [string, string] => r[1] != null);
	});
</script>

<svelte:head><title>{title ? `${title} · aniblyat` : 'aniblyat'}</title></svelte:head>

<QueryState {query}>
	{#if !media}
		<section class="page missing">
			<h1>{m.not_found_anime()}</h1>
			<a href={homePath()} class="btn">{m.back_home()}</a>
		</section>
	{:else}
		<article>
			<div class="banner" style:background-color={ground ?? 'var(--color-surface)'}>
				{#if media.bannerImage}
					<img src={media.bannerImage} alt="" width="1900" height="400" />
				{/if}
			</div>

			<div class="page body">
				<div class="cover-col">
					<div class="cover" style:background-color={ground ?? 'var(--color-surface)'}>
						{#if media.coverImage?.extraLarge}
							<img
								src={media.coverImage.extraLarge}
								alt={title}
								width="460"
								height="690"
								style:view-transition-name="cover-{media.id}"
							/>
						{/if}
					</div>
					<SaveButton
						item={{ id: media.id, title, cover: media.coverImage?.large ?? null }}
						variant="button"
					/>
				</div>

				<div class="main">
					<header>
						<h1>{title}</h1>
						{#if media.title?.romaji && media.title.romaji !== title}
							<p class="alt">{media.title.romaji}</p>
						{/if}
						{#if media.title?.native}<p class="alt" lang="ja">{media.title.native}</p>{/if}
					</header>

					<p
						class="airing"
						style:background-color={ground ?? 'var(--color-ink)'}
						style:color={ground ? inkOn(ground) : 'var(--color-bg)'}
					>
						<AiringBadge {media} showTime />
						{#if media.season && media.seasonYear}
							<a
								class="link season"
								href={seasonHref({ season: media.season, year: media.seasonYear })}
								>{titleCase(media.season)} {media.seasonYear}</a
							>
						{/if}
					</p>

					{#if media.genres?.length}
						<ul class="genres" aria-label={m.detail_genres()}>
							{#each media.genres as genre (genre)}<li>{genre}</li>{/each}
						</ul>
					{/if}

					{#if media.description}
						<section use:reveal>
							<h2>{m.detail_synopsis()}</h2>
							<p class="synopsis" lang="en">{stripHtml(media.description)}</p>
						</section>
					{/if}

					<section use:reveal>
						<h2>{m.detail_facts()}</h2>
						<dl class="facts">
							{#each facts as [label, value] (label)}
								<div>
									<dt>{label}</dt>
									<dd class="tabular">{value}</dd>
								</div>
							{/each}
						</dl>
					</section>

					{#if media.trailer?.site === 'youtube' && media.trailer.id}
						<section use:reveal>
							<h2>{m.detail_trailer()}</h2>
							<div class="trailer">
								<iframe
									src="https://www.youtube-nocookie.com/embed/{media.trailer.id}"
									title="{m.detail_trailer()} · {title}"
									loading="lazy"
									allow="encrypted-media; picture-in-picture; fullscreen"
								></iframe>
							</div>
						</section>
					{/if}
				</div>
			</div>

			{#if related.length}
				<section class="page related" use:reveal>
					<h2>{m.detail_related()}</h2>
					<ul>
						{#each related as rel (rel.node.id)}
							<li>
								<a href={animePath(rel.node.id)} class="rel">
									<span class="thumb">
										{#if rel.node.coverImage?.large}
											<img
												src={rel.node.coverImage.large}
												alt=""
												width="230"
												height="345"
												loading="lazy"
											/>
										{/if}
									</span>
									<span class="rel-type">{relLabel(rel.type)}</span>
									<span class="rel-title">{displayTitle(rel.node.title ?? {})}</span>
								</a>
							</li>
						{/each}
					</ul>
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
	.banner {
		height: min(40svh, 24vw);
		overflow: hidden;
	}
	.banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.body {
		display: grid;
		grid-template-columns: minmax(200px, 3fr) 9fr;
		gap: 48px;
		padding-bottom: 96px;
	}
	.cover-col {
		display: grid;
		gap: 16px;
		align-content: start;
		margin-top: -120px;
	}
	.cover-col :global(.btn) {
		width: 100%;
	}
	.cover {
		aspect-ratio: 2 / 3;
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.main {
		display: grid;
		gap: 40px;
		align-content: start;
		padding-top: 32px;
		max-width: 72ch;
	}
	h1 {
		font-size: clamp(2rem, 1.3rem + 2.4vw, 3.5rem);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.alt {
		margin-top: 8px;
		color: var(--color-muted);
	}
	.airing {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 24px;
		padding: 20px 24px;
		font-size: var(--text-lead);
		font-weight: 600;
	}
	.airing :global(span) {
		color: inherit;
	}
	.season {
		font-size: var(--text-body);
	}
	.genres {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: -16px;
	}
	.genres li {
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--color-accent-50);
		color: #134452;
		font-size: var(--text-small);
		font-weight: 600;
	}
	h2 {
		margin-bottom: 12px;
		font-size: var(--text-lead);
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.synopsis {
		white-space: pre-line;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 20px 24px;
	}
	dt {
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	dd {
		font-weight: 600;
	}
	.trailer {
		aspect-ratio: 16 / 9;
		background: var(--color-ink);
	}
	.trailer iframe {
		width: 100%;
		height: 100%;
		border: 0;
	}
	.related {
		padding-block: 0 120px;
	}
	.related ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 24px 16px;
	}
	.rel {
		display: grid;
		gap: 6px;
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
		color: var(--color-accent);
		font-weight: 600;
	}
	.rel-title {
		font-weight: 600;
		line-height: 1.25;
	}
	@media (max-width: 760px) {
		.body {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.cover-col {
			grid-template-columns: 120px 1fr;
			align-items: end;
			margin-top: -60px;
		}
		.main {
			padding-top: 0;
		}
	}
</style>
