<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { AniListError } from '../anilist/client';

	type Query = {
		isPending: boolean;
		isError: boolean;
		error: unknown;
		refetch: () => unknown;
	};

	let {
		query,
		children,
		pending,
		inset = false
	}: { query: Query; children: Snippet; pending?: Snippet; inset?: boolean } = $props();

	const rateLimited = $derived(query.error instanceof AniListError && query.error.status === 429);
</script>

{#if query.isPending}
	{#if pending}{@render pending()}{:else}<p class="state" class:page={inset} role="status">
			{m.loading()}
		</p>{/if}
{:else if query.isError}
	<div class="state" class:page={inset} role="alert">
		<p class="title">{m.error_title()}</p>
		<p>{rateLimited ? m.error_rate() : String((query.error as Error)?.message ?? '')}</p>
		<button type="button" class="btn btn-ink" onclick={() => query.refetch()}>{m.retry()}</button>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.state {
		display: grid;
		gap: 12px;
		justify-items: start;
		padding: 48px 0;
		color: var(--color-muted);
	}
	.state.page {
		padding-inline: var(--gutter);
	}
	.title {
		color: var(--color-ink);
		font-weight: 600;
	}
</style>
