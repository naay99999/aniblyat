<script lang="ts">
	import { figures } from '../text';

	// tabular figures on the digit runs only, so ":" and "." keep their natural width
	let { text }: { text: string } = $props();
</script>

{#each figures(text) as run, i (i)}{#if run.digits}<span class="tabular">{run.text}</span
		>{:else}{run.text}{/if}{/each}
