<script lang="ts">
	import { airingStatus, formatAirTime, statusLabel, type AiringInput } from '../airing';
	import { clock } from '../clock.svelte';

	let { media, showTime = false }: { media: AiringInput; showTime?: boolean } = $props();

	const status = $derived(airingStatus(media, clock.now));
</script>

<span class="tabular" class:next={status.kind === 'next'}>
	{statusLabel(status)}{#if showTime && status.kind === 'next'}<span class="time"
			>{` · ${formatAirTime(status.airingAt)}`}</span
		>{/if}
</span>

<style>
	.next {
		color: var(--color-ink);
	}
	span {
		color: var(--color-muted);
	}
	.time {
		color: inherit;
	}
</style>
