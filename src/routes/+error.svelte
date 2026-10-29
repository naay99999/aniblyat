<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { homePath } from '#lib/paths.js';
</script>

<section class="page error">
	<h1 class="display">{page.status === 404 ? m.not_found_page() : page.status}</h1>
	{#if page.status !== 404 && page.error?.message}<p>{page.error.message}</p>{/if}
	<a href={homePath()} class="btn">{m.back_home()}</a>
</section>

<style>
	.error {
		display: grid;
		gap: 24px;
		justify-items: start;
		align-content: center;
		min-height: 70svh;
	}
	h1 {
		font-size: var(--text-head);
	}
</style>
