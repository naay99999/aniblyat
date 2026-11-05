<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { formatCountdown } from '../airing';
	import { clock } from '../clock.svelte';

	let { airingAt }: { airingAt: number } = $props();

	// the shared clock ticks once a minute; this one face needs seconds
	let now = $state(clock.now);
	$effect(() => {
		now = Math.floor(Date.now() / 1000);
		const id = setInterval(() => (now = Math.floor(Date.now() / 1000)), 1000);
		return () => clearInterval(id);
	});

	const left = $derived(Math.max(0, airingAt - now));
	const cells = $derived([
		{ value: Math.floor(left / 86400), unit: m.unit_days() },
		{ value: Math.floor((left % 86400) / 3600), unit: m.unit_hours() },
		{ value: Math.floor((left % 3600) / 60), unit: m.unit_minutes() },
		{ value: left % 60, unit: m.unit_seconds() }
	]);
	// screen readers hear the minute-level phrase, not a number every second
	const spoken = $derived(formatCountdown(airingAt - clock.now));
</script>

{#if left > 0}
	<p class="countdown" role="img" aria-label={spoken}>
		{#each cells as cell (cell.unit)}
			<span class="cell" aria-hidden="true">
				<span class="value tabular">{cell.value}</span>
				<span class="unit">{cell.unit}</span>
			</span>
		{/each}
	</p>
{:else}
	<!-- aired: AniList moves on to the next episode a few minutes later, and the page refetches -->
	<p class="countdown aired">{m.countdown_now()}</p>
{/if}

<style>
	/* a departure board, not four buttons: figures on the ground, hairlines between them */
	.countdown {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.aired {
		display: block;
		font-size: var(--countdown-size, clamp(2rem, 1.5rem + 2vw, 3.5rem));
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.cell {
		display: grid;
		justify-items: start;
		gap: 6px;
		padding-inline: var(--space-2);
		border-left: 1px solid color-mix(in srgb, currentColor 25%, transparent);
	}
	.cell:first-child {
		padding-left: 0;
		border-left: 0;
	}
	.value {
		font-size: var(--countdown-size, clamp(2rem, 1.5rem + 2vw, 3.5rem));
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 0.9;
	}
	.unit {
		font-size: var(--text-small);
		font-weight: 600;
		opacity: 0.72;
	}
</style>
