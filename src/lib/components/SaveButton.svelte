<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { watchlist } from '../watchlist.svelte';

	let {
		item,
		variant = 'icon'
	}: { item: { id: number; title: string; cover: string | null }; variant?: 'icon' | 'button' } =
		$props();

	const saved = $derived(watchlist.has(item.id));
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
		watchlist.toggle(item);
	}}
>
	<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		background: var(--color-bg);
		color: var(--color-ink);
		transition:
			transform var(--t-press) var(--ease-out),
			background-color var(--t-hover) ease,
			color var(--t-hover) ease;
	}
	.icon:active {
		transform: scale(0.9);
	}
	.icon.saved {
		background: var(--color-accent);
		color: var(--color-accent-ink);
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
			background: var(--color-accent-100);
		}
	}
</style>
