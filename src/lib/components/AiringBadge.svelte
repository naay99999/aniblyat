<script lang="ts">
	import { airingStatus, formatAirTime, statusLabel, type AiringInput } from '../airing';
	import { clock } from '../clock.svelte';
	import Figures from './Figures.svelte';

	let { media, showTime = false }: { media: AiringInput; showTime?: boolean } = $props();

	const status = $derived(airingStatus(media, clock.now));
</script>

<span class:next={status.kind === 'next'}>
	<Figures text={statusLabel(status)} />{#if showTime && status.kind === 'next'}<span class="time"
			><Figures text={` · ${formatAirTime(status.airingAt)}`} /></span
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
