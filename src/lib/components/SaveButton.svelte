<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { Spring } from 'svelte/motion';
	import { toggleSaved } from '../save-feedback';
	import { watchlist } from '../watchlist.svelte';

	let {
		item,
		variant = 'icon'
	}: { item: { id: number; title: string; cover: string | null }; variant?: 'icon' | 'button' } =
		$props();

	const saved = $derived(watchlist.has(item.id));

	// the mark squeezes in and springs back past its size when it is pressed
	const pop = new Spring(1, { stiffness: 0.25, damping: 0.3 });
	function press() {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		pop.set(saved ? 0.85 : 0.55, { instant: true });
		pop.target = 1;
	}
</script>

<button
	type="button"
	class={variant === 'button' ? 'btn' : 'icon'}
	class:saved
	aria-pressed={saved}
	aria-label={variant === 'icon'
		? saved
			? m.unsave_label({ title: item.title })
			: m.save_label({ title: item.title })
		: undefined}
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		press();
		toggleSaved(item);
	}}
>
	<svg
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		style:transform="scale({pop.current})"
	>
		<path
			d="M6 3h12v18l-6-4.5L6 21z"
			fill={saved ? 'currentColor' : 'none'}
			stroke="currentColor"
			stroke-width="2"
			stroke-linejoin="round"
		/>
	</svg>
	{#if variant === 'button'}{saved ? m.saved() : m.save()}{/if}
</button>

<style>
	/* over a cover: a white glyph lifted off the picture by its own shadow, no square behind it */
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		color: #fff;
		transition:
			transform var(--t-press) var(--ease-out),
			background-color var(--t-ui) var(--ease-out),
			color var(--t-ui) var(--ease-out);
	}
	.icon:active {
		transform: scale(0.9);
	}
	.icon svg {
		filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.6));
	}
	/* saved is the one state that fills: the site's one accent */
	.icon.saved {
		background: var(--color-accent);
		color: var(--color-accent-ink);
	}
	.icon.saved svg {
		filter: none;
	}
	.btn.saved {
		background: var(--color-ink);
		color: var(--color-bg);
	}
	svg path {
		transition: fill var(--t-ui) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.icon:not(.saved):hover {
			background: rgb(10 10 10 / 0.35);
		}
	}
</style>
