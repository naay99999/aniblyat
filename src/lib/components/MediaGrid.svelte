<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import type { MediaCard } from '../anilist/queries';
	import AnimeCard from './AnimeCard.svelte';

	let { items }: { items: MediaCard[] } = $props();

	// a new order moves each card to its new place instead of redrawing the grid
	const still =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

<ul class="grid">
	{#each items as media (media.id)}
		<li animate:flip={{ duration: still ? 0 : 450, easing: cubicOut }}><AnimeCard {media} /></li>
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
