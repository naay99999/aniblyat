<script lang="ts">
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { isRateLimited } from '../anilist/client';
	import { queryView } from '../query-view';

	type Query = {
		isPending: boolean;
		isError: boolean;
		data: unknown;
		error: unknown;
		refetch: () => unknown;
	};

	let {
		query,
		children,
		pending,
		inset = false
	}: { query: Query; children: Snippet; pending?: Snippet; inset?: boolean } = $props();

	const rateLimited = $derived(isRateLimited(query.error));
	const view = $derived(queryView(query));
</script>

{#if view === 'pending'}
	{#if pending}{@render pending()}{:else}<p class="state" class:page={inset} role="status">
			{m.loading()}
		</p>{/if}
{:else if view === 'error'}
	{#snippet alert()}
		<div class="state" class:page={inset} class:over={pending} role="alert">
			<p class="title">{m.error_title()}</p>
			<p>{rateLimited ? m.error_rate() : m.error_generic()}</p>
			<button type="button" class="btn btn-ink" onclick={() => query.refetch()}>{m.retry()}</button>
		</div>
	{/snippet}
	{#if pending}
		<!-- the page keeps its shape: the ghosts stand still behind the message -->
		<div class="held">
			<div class="shape" aria-hidden="true" inert>{@render pending()}</div>
			{@render alert()}
		</div>
	{:else}
		{@render alert()}
	{/if}
{:else}
	{#if view === 'stale'}
		<p class="notice" class:page={inset} role="status">
			{m.error_title()}
			<button type="button" class="link" onclick={() => query.refetch()}>{m.retry()}</button>
		</p>
	{/if}
	{@render children()}
{/if}

<style>
	.notice {
		padding-block: 12px;
		font-size: var(--text-small);
		color: var(--color-muted);
	}
	.notice button {
		margin-left: 8px;
		font-weight: 600;
		color: var(--color-ink);
	}
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
	.held {
		display: grid;
	}
	.held > * {
		grid-area: 1 / 1;
	}
	/* a held shape must not pulse: nothing is loading */
	.shape :global(*) {
		animation: none !important;
	}
	.state.over {
		align-self: start;
		justify-self: start;
		margin-top: 48px;
		padding: 24px;
		background: var(--color-raised);
	}
	.state.over.page {
		margin-inline: var(--gutter);
		padding-inline: 24px;
	}
	.title {
		color: var(--color-ink);
		font-weight: 600;
	}
</style>
