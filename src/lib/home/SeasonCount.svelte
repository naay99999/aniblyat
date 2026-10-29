<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { reveal } from '../actions/reveal';
	import { seasonHref } from '../paths';
	import { seasonLabel, type Season } from '../season';

	let { season, count }: { season: Season; count: number | undefined } = $props();
</script>

<section class="count page" aria-labelledby="count-title">
	<h2 id="count-title" class="claim" use:reveal>{m.home_count_title()}</h2>
	<div class="figure-block">
		<p class="figure display tabular" use:reveal={1}>
			<a href={seasonHref(season)} class:pending={count == null}>{count ?? '…'}</a><sup
				>{m.home_count_unit()}</sup
			>
		</p>
		<p class="caption" use:reveal={2}>
			{m.home_count_caption({ season: seasonLabel(season) })}
		</p>
	</div>
</section>

<style>
	.count {
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 90svh;
		padding-block: 120px 96px;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.claim {
		font-size: var(--text-lead);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	.figure-block {
		align-self: end;
		padding-top: 12vh;
	}
	.figure {
		font-size: clamp(180px, 23vw, 380px);
		line-height: 0.8;
		min-height: 0.8em;
	}
	.pending {
		color: #5c5852;
	}
	.figure a {
		transition: color var(--t-hover) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.figure a:hover {
			color: var(--color-accent-200);
		}
	}
	sup {
		font-size: 0.2em;
		letter-spacing: -0.02em;
		vertical-align: top;
		margin-left: 0.15em;
		position: relative;
		top: 0.15em;
	}
	.caption {
		margin-top: 32px;
		max-width: 34ch;
		font-size: var(--text-body);
	}
	@media (max-width: 720px) {
		.count {
			min-height: 80svh;
		}
		.figure {
			font-size: 40vw;
		}
	}
</style>
