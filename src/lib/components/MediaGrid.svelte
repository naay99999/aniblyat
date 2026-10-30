<script lang="ts">
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import { m } from '#lib/paraglide/messages.js';
	import type { MediaCard } from '../anilist/queries';
	import AnimeCard from './AnimeCard.svelte';

	// no items yet: the grid holds its shape with `ghosts` blank cards
	let { items, ghosts = 12 }: { items: MediaCard[] | undefined; ghosts?: number } = $props();

	// a new order moves each card to its new place instead of redrawing the grid
	const still =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
</script>

{#if items}
	<ul class="grid">
		{#each items as media (media.id)}
			<li animate:flip={{ duration: still ? 0 : 400, easing: expoOut }}><AnimeCard {media} /></li>
		{/each}
	</ul>
{:else}
	<ul class="grid" role="status" aria-label={m.loading()}>
		{#each { length: ghosts }, i (i)}
			<li class="blank">
				<span class="ghost cover"></span>
				<span class="ghost ghost-line"></span>
				<span class="ghost ghost-line short"></span>
			</li>
		{/each}
	</ul>
{/if}

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
	.blank {
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.cover {
		aspect-ratio: 2 / 3;
		margin-bottom: 4px;
	}
	.short {
		width: 55%;
	}
</style>
