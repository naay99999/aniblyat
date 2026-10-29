<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { reveal } from '#lib/actions/reveal.js';
	import { seasonHref } from '#lib/paths.js';
	import { currentSeason, sameSeason, seasonGrid } from '#lib/season.js';

	const now = new Date();
	const current = currentSeason(now);
	const grid = seasonGrid(now);
	const names = { WINTER: 'Winter', SPRING: 'Spring', SUMMER: 'Summer', FALL: 'Fall' } as const;
</script>

<svelte:head><title>{m.seasons_title()} · aniblyat</title></svelte:head>

<div class="page screen">
	<header>
		<h1>{m.seasons_title()}</h1>
		<p class="sub">{m.seasons_lead()}</p>
	</header>

	<ol class="years">
		{#each grid as row, i (row.year)}
			<li class="year" use:reveal={Math.min(i, 6)}>
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
								{names[s.season]}
								{#if isCurrent}<span class="marker">{m.current_marker()}</span>{/if}
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
		padding-block: 32px 120px;
	}
	h1 {
		font-size: var(--text-title);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.sub {
		margin-top: 8px;
		color: var(--color-muted);
	}
	.years {
		list-style: none;
		margin-top: 56px;
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
		padding: 0 18px;
		background: var(--color-raised);
		font-weight: 600;
		transition:
			background-color var(--t-hover) ease,
			transform var(--t-press) var(--ease-out);
	}
	.season:active {
		transform: scale(0.98);
	}
	.season.current {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}
	.marker {
		font-size: var(--text-small);
		font-weight: 400;
	}
	@media (hover: hover) and (pointer: fine) {
		.season:not(.current):hover {
			background: var(--color-accent-100);
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
	}
</style>
