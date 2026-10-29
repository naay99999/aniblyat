<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, setLocale } from '#lib/paraglide/runtime.js';
	import favicon from '#lib/assets/favicon.svg';
	import { queryClient } from '#lib/anilist/query-client.svelte.js';
	import { currentSeason } from '#lib/season.js';
	import { homePath, listPath, seasonHref, seasonsPath } from '#lib/paths.js';
	import './layout.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const thisSeason = seasonHref(currentSeason(new Date()));
	const links = $derived([
		{ href: homePath(), label: m.nav_home(), active: page.url.pathname === '/' },
		{ href: thisSeason, label: m.nav_season(), active: page.url.pathname === thisSeason },
		{
			href: seasonsPath(),
			label: m.nav_seasons(),
			active:
				page.url.pathname.startsWith('/seasons') ||
				(page.url.pathname.startsWith('/season/') && page.url.pathname !== thisSeason)
		},
		{ href: listPath(), label: m.nav_list(), active: page.url.pathname === '/list' }
	]);

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>aniblyat</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<a class="skip" href="#main">{m.nav_skip()}</a>
	<header class="bar page">
		<a href={homePath()} class="wordmark">aniblyat</a>
		<nav aria-label="main">
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} class="link" aria-current={link.active ? 'page' : undefined}
							>{link.label}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
		<button
			type="button"
			class="lang link"
			lang={getLocale() === 'th' ? 'en' : 'th'}
			onclick={() => setLocale(getLocale() === 'th' ? 'en' : 'th')}>{m.nav_language()}</button
		>
	</header>

	<main id="main">
		{@render children()}
	</main>
</QueryClientProvider>

<style>
	.skip {
		position: absolute;
		left: 8px;
		top: -100px;
		z-index: 50;
		padding: 8px 12px;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.skip:focus {
		top: 8px;
	}
	.bar {
		position: relative;
		z-index: 20;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 24px;
		min-height: 64px;
		font-weight: 600;
		font-size: var(--text-small);
	}
	.wordmark {
		font-weight: 800;
		font-size: 1.125rem;
		letter-spacing: -0.04em;
	}
	nav ul {
		display: flex;
		gap: 24px;
		justify-content: center;
	}
	[aria-current='page'] {
		text-decoration-color: currentColor;
	}
	.lang {
		font-weight: 600;
	}
	@media (max-width: 720px) {
		.bar {
			grid-template-columns: 1fr auto;
			row-gap: 0;
			padding-block: 12px;
		}
		nav {
			grid-column: 1 / -1;
			grid-row: 2;
			overflow-x: auto;
		}
		nav ul {
			justify-content: flex-start;
			gap: 20px;
			padding-block: 8px;
			white-space: nowrap;
		}
	}
</style>
