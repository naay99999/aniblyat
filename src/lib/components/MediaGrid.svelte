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
	/*
	 * posters fill the row down to --min wide, but never more than --cols to a row: past that the
	 * posters grow instead, so a wide screen gets bigger posters rather than a denser wall
	 */
	.grid {
		--min: 150px;
		--cols: 6;
		--gap-x: clamp(20px, 2.4vw, 48px);
		display: grid;
		grid-template-columns: repeat(
			auto-fill,
			minmax(max(var(--min), (100% - (var(--cols) - 1) * var(--gap-x)) / var(--cols)), 1fr)
		);
		gap: clamp(40px, 4vw, 64px) var(--gap-x);
	}
	@media (min-width: 1200px) {
		.grid {
			--min: 190px;
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
