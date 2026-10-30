<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { PersistQueryClientProvider } from '@tanstack/svelte-query-persist-client';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, setLocale } from '#lib/paraglide/runtime.js';
	import favicon from '#lib/assets/favicon.svg';
	import {
		CACHE_MAX_AGE,
		persister,
		queryClient,
		shouldPersist
	} from '#lib/anilist/query-client.svelte.js';
	import { browser, version } from '$app/env';
	import { QueryClient } from '@tanstack/svelte-query';
	import { clock } from '#lib/clock.svelte.js';
	import { currentSeason } from '#lib/season.js';
	import { Toaster } from 'svelte-sonner';
	import SearchBox from '#lib/components/SearchBox.svelte';
	import { coverFor, handOff, takeHandOff } from '#lib/cover-handoff.js';
	import { watchlist } from '#lib/watchlist.svelte.js';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import { homePath, listPath, seasonHref, seasonsPath } from '#lib/paths.js';
	import './layout.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// a server render gets its own client so no request sees another's cache
	const client = browser ? queryClient : new QueryClient();

	// follows the shared clock, so a tab left open across a season boundary moves on
	const thisSeason = $derived(seasonHref(currentSeason(new Date(clock.now * 1000))));
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
		{ href: listPath(), label: m.nav_list(), active: page.url.pathname === '/list', list: true }
	]);

	// the list lives in this browser only: count it once the page is running here
	let mounted = $state(false);
	onMount(() => (mounted = true));
	const listCount = $derived(mounted ? watchlist.items.length : 0);

	// the bar stays, slimmer once the page moves; on a phone its row of links folds away
	// while reading down and comes back on the way up
	let compact = $state(false);
	let folded = $state(false);
	let searching = $state(false);
	let bar: HTMLElement;
	$effect(() => {
		let last = window.scrollY;
		let frame = 0;
		const update = () => {
			frame = 0;
			const y = window.scrollY;
			compact = y > 24;
			if (Math.abs(y - last) < 8) return;
			folded = y > last && y > 160;
			last = y;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});
	// sticky parts of a page sit under the bar at whatever height it has now
	$effect(() => {
		const root = document.documentElement.style;
		const ro = new ResizeObserver(() => root.setProperty('--bar-shown', `${bar.offsetHeight}px`));
		ro.observe(bar);
		return () => ro.disconnect();
	});

	// a click on a link to a title marks its cover for the hand-off
	$effect(() => {
		const onClick = (e: MouseEvent) => {
			const link = (e.target as Element | null)?.closest?.('a');
			if (link?.pathname.startsWith('/anime/')) handOff(coverFor(link));
		};
		document.addEventListener('click', onClick, true);
		return () => document.removeEventListener('click', onClick, true);
	});

	onNavigate((navigation) => {
		const cover = navigation.to?.route.id === '/anime/[id]' ? takeHandOff() : null;
		if (!document.startViewTransition) return;
		const root = document.documentElement;
		if (cover) {
			cover.style.viewTransitionName = 'cover';
			root.classList.add('vt-cover');
		}
		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				if (cover) cover.style.viewTransitionName = '';
				resolve();
				await navigation.complete;
			});
			transition.finished.finally(() => root.classList.remove('vt-cover'));
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" sizes="any" />
	<title>aniblyat</title>
</svelte:head>

<PersistQueryClientProvider
	{client}
	persistOptions={{
		persister,
		maxAge: CACHE_MAX_AGE,
		buster: version,
		dehydrateOptions: {
			shouldDehydrateQuery: (q) =>
				q.state.status === 'success' && shouldPersist(q.queryKey, new Date())
		}
	}}
>
	<a class="skip" href="#main">{m.nav_skip()}</a>
	<!-- the slot keeps its height, so the bar can shrink without moving the page under it -->
	<div class="bar-slot">
		<header class="bar page" class:compact class:folded={folded && !searching} bind:this={bar}>
			<a href={homePath()} class="wordmark">aniblyat</a>
			<nav aria-label="main">
				<ul>
					{#each links as link (link.href)}
						<li>
							<a href={link.href} class="link" aria-current={link.active ? 'page' : undefined}
								>{link.label}{#if link.list && listCount}
									{#key listCount}<span class="count tabular">{listCount}</span>{/key}
								{/if}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
			<SearchBox onopenchange={(open) => (searching = open)} />
			<button
				type="button"
				class="lang link"
				lang={getLocale() === 'th' ? 'en' : 'th'}
				onclick={() => setLocale(getLocale() === 'th' ? 'en' : 'th')}>{m.nav_language()}</button
			>
		</header>
	</div>

	<Toaster
		position="bottom-left"
		duration={5000}
		offset={16}
		toastOptions={{
			unstyled: true,
			classes: { toast: 'toast', title: 'toast-title', actionButton: 'toast-action' }
		}}
	/>

	<main id="main">
		{@render children()}
	</main>
	<SiteFooter />
</PersistQueryClientProvider>

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
	.bar-slot {
		position: sticky;
		top: 0;
		z-index: 20;
		height: var(--nav-h);
		pointer-events: none;
	}
	.bar {
		pointer-events: auto;
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 24px;
		min-height: var(--nav-h);
		background: var(--bar-bg, var(--color-bg));
		color: var(--bar-ink, var(--color-ink));
		font-weight: 600;
		font-size: var(--text-small);
		transition:
			min-height var(--t-move) var(--ease-out),
			background-color var(--t-scene) var(--ease-out),
			color var(--t-scene) var(--ease-out);
	}
	.compact {
		min-height: 48px;
	}
	.wordmark {
		font-weight: 800;
		font-size: var(--text-body);
		letter-spacing: -0.04em;
	}
	nav ul {
		display: flex;
		gap: 24px;
		justify-content: center;
	}
	.count {
		display: inline-grid;
		place-items: center;
		min-width: 1.5em;
		height: 1.5em;
		margin-left: 6px;
		padding-inline: 4px;
		background: var(--color-accent);
		color: var(--color-accent-ink);
		font-size: 0.85em;
		line-height: 1;
		vertical-align: 0.05em;
	}
	@media (prefers-reduced-motion: no-preference) {
		.count {
			animation: bump var(--t-move) var(--ease-out);
		}
	}
	@keyframes bump {
		from {
			transform: scale(1.6);
		}
	}
	[aria-current='page'] {
		text-decoration-color: currentColor;
	}
	.lang {
		font-weight: 600;
	}
	@media (max-width: 720px) {
		.bar {
			grid-template-columns: 1fr auto auto;
			column-gap: 8px;
			row-gap: 0;
			padding-block: 6px 4px;
		}
		.compact {
			min-height: 0;
		}
		nav {
			grid-column: 1 / -1;
			grid-row: 2;
			overflow-x: auto;
			max-height: 44px;
			transition:
				max-height var(--t-move) var(--ease-out),
				opacity var(--t-ui) var(--ease-out);
		}
		.folded nav {
			max-height: 0;
			opacity: 0;
			visibility: hidden;
		}
		nav ul {
			justify-content: flex-start;
			gap: 20px;
			padding-block: 8px;
			white-space: nowrap;
		}
	}
</style>
