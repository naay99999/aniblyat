<script lang="ts">
	import { goto } from '$app/navigation';
	import { createQuery } from '@tanstack/svelte-query';
	import { m } from '#lib/paraglide/messages.js';
	import { searchAnime } from '../anilist/queries';
	import { handOff } from '../cover-handoff';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	let { onopenchange }: { onopenchange?: (open: boolean) => void } = $props();

	let input: HTMLInputElement;
	let query = $state('');
	let term = $state('');
	let focused = $state(false);
	let dismissed = $state(false);
	let expanded = $state(false); // phone only: the field is behind a button
	let active = $state(0);

	// AniList allows 30 requests a minute: ask only once typing pauses
	$effect(() => {
		const q = query.trim();
		const id = setTimeout(() => (term = q), 350);
		return () => clearTimeout(id);
	});

	const results = createQuery(() => ({
		queryKey: ['search', term.toLowerCase()],
		queryFn: () => searchAnime(term),
		enabled: term.length >= 2,
		staleTime: 10 * 60_000,
		placeholderData: (previous: Awaited<ReturnType<typeof searchAnime>> | undefined) => previous
	}));

	const items = $derived(term.length >= 2 ? (results.data ?? []) : []);

	// the part of a title that matches what was typed, to mark it
	function parts(title: string): { text: string; hit: boolean }[] {
		const needle = term.trim().toLowerCase();
		const at = needle ? title.toLowerCase().indexOf(needle) : -1;
		if (at < 0) return [{ text: title, hit: false }];
		return [
			{ text: title.slice(0, at), hit: false },
			{ text: title.slice(at, at + needle.length), hit: true },
			{ text: title.slice(at + needle.length), hit: false }
		].filter((p) => p.text);
	}
	const open = $derived(focused && !dismissed && query.trim().length >= 2);
	const searching = $derived(query.trim() !== term || results.isFetching);

	$effect(() => onopenchange?.(open || expanded));

	const year = (media: (typeof items)[number]) => media.startDate?.year ?? '';

	function pick(id: number) {
		handOff(document.querySelector<HTMLImageElement>(`#search-${id} img`));
		query = '';
		term = '';
		expanded = false;
		input.blur();
		goto(animePath(id));
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' && items.length) {
			e.preventDefault();
			dismissed = false;
			active = (active + 1) % items.length;
		} else if (e.key === 'ArrowUp' && items.length) {
			e.preventDefault();
			active = (active - 1 + items.length) % items.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (open && items[active]) pick(items[active].id);
		} else if (e.key === 'Escape') {
			if (open) dismissed = true;
			else if (query) query = '';
			else {
				expanded = false;
				input.blur();
			}
		}
	}

	async function expand() {
		expanded = true;
		await Promise.resolve();
		input.focus();
	}
</script>

<div class="search" class:expanded>
	<button type="button" class="toggle" aria-label={m.search_open()} onclick={expand}>
		<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
			<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
			<path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>

	<form role="search" class="form" onsubmit={(e) => e.preventDefault()}>
		<svg class="glass" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
			<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
			<path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
		<input
			bind:this={input}
			bind:value={query}
			type="search"
			class="field"
			placeholder={m.search_placeholder()}
			aria-label={m.search_label()}
			role="combobox"
			aria-expanded={open}
			aria-controls="search-results"
			aria-autocomplete="list"
			aria-activedescendant={open && items[active] ? `search-${items[active].id}` : undefined}
			autocomplete="off"
			spellcheck="false"
			oninput={() => {
				dismissed = false;
				active = 0;
			}}
			onfocus={() => (focused = true)}
			onblur={() => {
				focused = false;
				if (!query) expanded = false;
			}}
			{onkeydown}
		/>
		<button
			type="button"
			class="close"
			aria-label={m.search_close()}
			onclick={() => {
				query = '';
				expanded = false;
			}}
		>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path
					d="m6 6 12 12M18 6 6 18"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	</form>

	<div class="panel" hidden={!open}>
		<ul id="search-results" role="listbox" aria-label={m.search_results()}>
			{#each items as media, i (media.id)}
				<!-- options are picked with pointerdown so the input's blur doesn't close the list first -->
				<li
					id="search-{media.id}"
					role="option"
					aria-selected={i === active}
					class="option"
					style:--i={i}
					onpointerdown={(e) => {
						e.preventDefault();
						pick(media.id);
					}}
					onpointerenter={() => (active = i)}
				>
					{#if media.coverImage?.large}
						<img src={media.coverImage.large} alt="" width="40" height="60" loading="lazy" />
					{:else}
						<span class="blank"></span>
					{/if}
					<span class="text">
						<span class="name"
							>{#each parts(displayTitle(media.title ?? {})) as part, j (j)}{#if part.hit}<mark
										>{part.text}</mark
									>{:else}{part.text}{/if}{/each}</span
						>
						<span class="meta"
							>{[media.format?.replace('_', ' '), year(media)].filter(Boolean).join(' · ')}</span
						>
					</span>
				</li>
			{/each}
		</ul>
		{#if items.length === 0}
			<p class="note" aria-live="polite">
				{searching ? m.search_loading() : m.search_empty({ query: query.trim() })}
			</p>
		{/if}
	</div>
</div>

<style>
	.search {
		position: relative;
	}
	.toggle,
	.close {
		display: none;
		place-items: center;
		width: 44px;
		height: 44px;
		color: inherit;
	}
	.form {
		position: relative;
		display: flex;
		align-items: center;
	}
	.glass {
		position: absolute;
		left: 12px;
		pointer-events: none;
	}
	.field {
		width: clamp(180px, 18vw, 280px);
		height: 40px;
		padding: 0 12px 0 38px;
		border: 0;
		border-radius: 0;
		background: color-mix(in srgb, currentColor 10%, transparent);
		color: inherit;
		font: inherit;
		font-weight: 500;
		transition: background-color var(--t-hover) ease;
	}
	.field::placeholder {
		color: inherit;
		opacity: 0.72;
	}
	.field:focus {
		box-shadow: none; /* taste-skill-ignore: resets the forms plugin focus ring */
		background: color-mix(in srgb, currentColor 16%, transparent);
	}
	.field::-webkit-search-cancel-button {
		display: none;
	}
	.panel {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		z-index: 30;
		width: min(440px, calc(100vw - 2 * var(--gutter)));
		padding: 8px;
		background: var(--color-raised);
		color: var(--color-ink);
		box-shadow: 0 16px 40px rgb(10 10 10 / 0.22); /* taste-skill-ignore: the results float over the page */
	}
	.panel[hidden] {
		display: none;
	}
	.option {
		display: grid;
		grid-template-columns: 40px 1fr;
		align-items: center;
		gap: 14px;
		padding: 8px;
		cursor: pointer;
	}
	.option[aria-selected='true'] {
		background: var(--color-accent-50);
	}
	/* each new set of results steps in from the top */
	@media (prefers-reduced-motion: no-preference) {
		.option {
			animation: drop 320ms var(--ease-expo) both;
			animation-delay: calc(var(--i) * 25ms);
		}
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	mark {
		background: var(--color-accent-100);
		color: inherit;
	}
	.option img,
	.blank {
		width: 40px;
		height: 60px;
		object-fit: cover;
		background: var(--color-surface);
	}
	.text {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.name {
		font-weight: 600;
		line-height: 1.25;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta,
	.note {
		font-size: var(--text-small);
		font-weight: 400;
		color: var(--color-muted);
	}
	.note {
		padding: 12px 8px;
	}
	@media (max-width: 720px) {
		.search {
			position: static;
		}
		.toggle {
			display: grid;
		}
		.form {
			display: none;
		}
		.expanded .toggle {
			visibility: hidden;
		}
		.expanded .form {
			position: absolute;
			inset: 0 0 auto;
			z-index: 2;
			display: flex;
			gap: 8px;
			height: 64px;
			padding: 10px var(--gutter);
			background: var(--bar-bg, var(--color-bg));
		}
		.expanded .glass {
			left: calc(var(--gutter) + 12px);
		}
		.expanded .field {
			flex: 1;
			width: auto;
			height: 44px;
		}
		.expanded .close {
			display: grid;
		}
		.panel {
			top: 64px;
			left: var(--gutter);
			right: var(--gutter);
			width: auto;
		}
	}
</style>
