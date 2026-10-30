<script lang="ts">
	import type { MediaCard } from '../anilist/queries';
	import { displayTitle } from '../text';
	import { animePath } from '../paths';
	import AiringBadge from './AiringBadge.svelte';
	import SaveButton from './SaveButton.svelte';

	let { media, note }: { media: MediaCard; note?: string } = $props();

	const title = $derived(displayTitle(media.title ?? {}));
	const cover = $derived(media.coverImage?.extraLarge ?? media.coverImage?.large ?? null);
</script>

<article class="card">
	<a
		href={animePath(media.id)}
		class="cover"
		style:background-color={media.coverImage?.color ?? 'var(--color-surface)'}
	>
		{#if cover}
			<img src={cover} alt="" width="460" height="690" loading="lazy" data-cover />
		{/if}
	</a>
	<div class="save"><SaveButton item={{ id: media.id, title, cover }} /></div>
	<h3><a href={animePath(media.id)} class="link">{title}</a></h3>
	<p class="meta"><AiringBadge {media} /></p>
	{#if note}<p class="note">{note}</p>{/if}
</article>

<style>
	.card {
		position: relative;
		display: grid;
		gap: 6px;
		align-content: start;
	}
	.cover {
		display: block;
		aspect-ratio: 2 / 3;
		overflow: hidden;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--t-move) var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.card:hover .cover img {
			transform: scale(1.04);
		}
	}
	.save {
		position: absolute;
		top: 8px;
		right: 8px;
	}
	h3 {
		margin-top: 4px;
		font-weight: 600;
		font-size: var(--text-body);
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.meta,
	.note {
		font-size: var(--text-small);
	}
	.note {
		color: var(--color-muted);
	}
</style>
