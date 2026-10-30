<script lang="ts">
	import type { MediaCard } from '../anilist/queries';
	import AnimeCard from './AnimeCard.svelte';

	let { items }: { items: MediaCard[] } = $props();
</script>

<ul class="grid">
	{#each items as media (media.id)}
		<li><AnimeCard {media} /></li>
	{/each}
</ul>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 32px 20px;
	}
	@media (min-width: 1200px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		}
	}
</style>
