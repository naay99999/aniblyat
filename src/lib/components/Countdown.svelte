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
	<p class="countdown tabular" role="img" aria-label={spoken}>
		{#each cells as cell (cell.unit)}
			<span class="cell" aria-hidden="true">
				<span class="value">{cell.value}</span>
				<span class="unit">{cell.unit}</span>
			</span>
		{/each}
	</p>
{:else}
	<!-- aired: AniList moves on to the next episode a few minutes later, and the page refetches -->
	<p class="countdown aired">{m.countdown_now()}</p>
{/if}

<style>
	.countdown {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 8px;
	}
	.aired {
		display: block;
		padding: 0.3em 0.4em;
		background: color-mix(in srgb, currentColor 10%, transparent);
		font-size: var(--countdown-size, clamp(2.5rem, 1.6rem + 3.6vw, 5.5rem));
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.cell {
		display: grid;
		justify-items: center;
		gap: 4px;
		padding: 0.18em 0 0.3em;
		background: color-mix(in srgb, currentColor 10%, transparent);
	}
	.value {
		font-size: var(--countdown-size, clamp(2.5rem, 1.6rem + 3.6vw, 5.5rem));
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
	}
	.unit {
		font-size: var(--text-small);
		font-weight: 600;
	}
</style>
