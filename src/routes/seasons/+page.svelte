<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { intlLocale } from '#lib/airing.js';
	import { getSeason } from '#lib/anilist/queries.js';
	import { sortMedia } from '#lib/rank.js';
	import { clock } from '#lib/clock.svelte.js';
	import { seasonHref } from '#lib/paths.js';
	import { currentSeason, sameSeason, seasonGrid, seasonLabel } from '#lib/season.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// follows the shared clock, so a tab left open across a season boundary moves on
	const now = $derived(new Date(clock.now * 1000));
	const current = $derived(currentSeason(now));
	const grid = $derived(seasonGrid(now));

	// the season on air carries its own faces; the home page has usually cached this query
	const onAir = createQuery(() => ({
		queryKey: ['season', current.year, current.season],
		queryFn: () => getSeason(current)
	}));
	const faces = $derived(
		onAir.data
			? sortMedia(onAir.data, 'popularity', clock.now)
					.filter((md) => md.coverImage?.large)
					.slice(0, 5)
			: (data.faces ?? [])
	);
	const names = { WINTER: 'Winter', SPRING: 'Spring', SUMMER: 'Summer', FALL: 'Fall' } as const;
	// the months each season covers, in the UI's language: Winter is January to March
	const firstMonth = { WINTER: 0, SPRING: 3, SUMMER: 6, FALL: 9 } as const;
	const monthName = new Intl.DateTimeFormat(intlLocale(), { month: 'short', timeZone: 'UTC' });
	const span = (season: keyof typeof firstMonth) => {
		const from = firstMonth[season];
		const at = (mo: number) => monthName.format(new Date(Date.UTC(2000, mo, 1)));
		return `${at(from)}–${at(from + 2)}`;
	};
</script>

<svelte:head><title>{m.seasons_title()} · aniblyat</title></svelte:head>

<div class="page screen">
	<header class="head">
		<div class="words">
			<h1 class="display">{m.seasons_title()}</h1>
			<p class="lead">{m.seasons_lead()}</p>
		</div>
		<a href={seasonHref(current)} class="now">
			<span class="now-label">{m.seasons_now()}</span>
			{#if faces.length}
				<span class="faces" aria-hidden="true">
					{#each faces as media (media.id)}
						<img
							src={media.coverImage?.extraLarge ?? media.coverImage?.large}
							alt=""
							width="460"
							height="690"
						/>
					{/each}
				</span>
			{:else if onAir.isPending}
				<span class="faces" aria-hidden="true">
					{#each { length: 5 }, i (i)}<span class="ghost face"></span>{/each}
				</span>
			{/if}
			<span class="now-name display">{seasonLabel(current)}</span>
			<span class="arrow" aria-hidden="true">→</span>
		</a>
	</header>

	<ol class="years">
		{#each grid as row (row.year)}
			<li class="year">
				<h2 class="tabular">{row.year}</h2>
				<ul>
					{#each row.seasons as s (s.season)}
						{@const isCurrent = sameSeason(s, current)}
						<li>
							<a
								href={seasonHref(s)}
								class="season"
								class:current={isCurrent}
								aria-current={isCurrent ? 'date' : undefined}
							>
								<span>
									{names[s.season]}
									{#if isCurrent}<span class="sr-only">({m.seasons_now()})</span>{/if}
								</span>
								<span class="months">{span(s.season)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>
</div>

<style>
	.screen {
		padding-block: var(--space-4) var(--section);
	}
	.head {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: end;
		padding-top: 24px;
	}
	.words {
		grid-column: 1 / 8;
		display: grid;
		gap: 24px;
	}
	h1 {
		font-size: clamp(3rem, 1.8rem + 4vw, 6rem);
	}
	.lead {
		max-width: 34ch;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	/* the season on air now, as the page's one big way in */
	.now {
		grid-column: 8 / -1;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: 8px 16px;
		min-height: 260px;
		padding: 28px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		transition:
			background-color var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.now:active {
		transform: scale(0.99);
	}
	@media (hover: hover) and (pointer: fine) {
		.now:hover {
			background: var(--color-accent-text);
		}
		.now:hover .arrow {
			transform: translateX(8px);
		}
	}
	.faces {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 6px;
		margin-block: 8px 16px;
	}
	.faces img,
	.face {
		width: 100%;
		aspect-ratio: 2 / 3;
		object-fit: cover;
	}
	.now-label {
		grid-column: 1 / -1;
		align-self: start;
		font-size: var(--text-lead);
		font-weight: 600;
	}
	.now-name {
		font-size: clamp(2.5rem, 1.6rem + 2.6vw, 4.25rem);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.arrow {
		font-size: var(--text-head);
		font-weight: 600;
		line-height: 1;
		transition: transform var(--t-ui) var(--ease-out);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	.years {
		list-style: none;
		margin-top: 120px;
		display: grid;
		gap: 4px;
	}
	.year {
		display: grid;
		grid-template-columns: minmax(4ch, 1fr) 4fr;
		align-items: center;
		gap: 16px;
		padding-block: 10px;
	}
	h2 {
		font-size: clamp(28px, 3vw, 48px);
		font-weight: 800;
		letter-spacing: -0.04em;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}
	.season {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-height: 56px;
		padding: 0 14px;
		background: var(--color-raised);
		font-weight: 600;
		transition:
			background-color var(--t-ui) var(--ease-out),
			transform var(--t-press) var(--ease-out);
	}
	.season:active {
		transform: scale(0.98);
	}
	.months {
		font-weight: 400;
	}
	.season.current {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}
	@media (hover: hover) and (pointer: fine) {
		.season:not(.current):hover {
			background: var(--color-accent-100);
		}
	}
	@media (max-width: 900px) {
		.head {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 32px;
		}
		.words,
		.now {
			grid-column: 1;
		}
		h1 {
			font-size: 15vw;
		}
		.now {
			min-height: 180px;
			padding: 20px;
		}
		.years {
			margin-top: 72px;
		}
	}
	@media (max-width: 720px) {
		.year {
			grid-template-columns: 1fr;
			gap: 8px;
		}
		ul {
			grid-template-columns: repeat(2, 1fr);
		}
		.season {
			padding-inline: 10px;
		}
	}
</style>
