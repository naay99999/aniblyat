<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { reveal } from '../actions/reveal';
	import { homePath, listPath, seasonHref, seasonsPath } from '../paths';
	import { clock } from '../clock.svelte';
	import { currentSeason } from '../season';

	const links = $derived([
		{ href: homePath(), label: m.nav_home() },
		{ href: seasonHref(currentSeason(new Date(clock.now * 1000))), label: m.nav_season() },
		{ href: seasonsPath(), label: m.nav_seasons() },
		{ href: listPath(), label: m.nav_list() }
	]);
	const letters = [...'aniblyat'];

	// the name sits at the very end of the page, below where the shared reveal fires:
	// it rises once a fifth of it is on screen
	let name: HTMLElement;
	let risen = $state(false);
	$effect(() => {
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return;
				risen = true;
				io.disconnect();
			},
			{ threshold: 0.2 }
		);
		io.observe(name);
		return () => io.disconnect();
	});
</script>

<!-- the close: the places as big type, then the name across the whole width -->
<footer class="footer page">
	<div class="top">
		<ul class="places">
			{#each links as link, i (link.href)}
				<li use:reveal={i}>
					<a href={link.href} class="place"
						><span>{link.label}</span><span class="arrow" aria-hidden="true">→</span></a
					>
				</li>
			{/each}
		</ul>
		<div class="small">
			<p>
				{m.footer_note()} ·
				<a href="https://anilist.co" class="link" rel="external noopener">anilist.co</a>
			</p>
			<a href="#main" class="link">{m.footer_top()} <span aria-hidden="true">↑</span></a>
		</div>
	</div>
	<p class="name display" class:risen bind:this={name} aria-hidden="true">
		{#each letters as letter, i (i)}<span style:--i={i}>{letter}</span>{/each}
	</p>
</footer>

<style>
	.footer {
		display: grid;
		gap: var(--space-6);
		padding-top: var(--section);
		overflow: hidden;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.top {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--gutter);
		align-items: end;
	}
	.places {
		grid-column: 1 / 9;
		display: grid;
		list-style: none;
	}
	.place {
		display: inline-flex;
		align-items: baseline;
		gap: 0.3em;
		padding-block: 0.06em;
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.05;
		color: var(--color-bg);
		transition: color var(--t-ui) var(--ease-out);
	}
	/* the arrow slides out of the word on hover and focus */
	.arrow {
		color: var(--color-accent-200);
		opacity: 0;
		transform: translateX(-0.4em);
		transition:
			opacity var(--t-ui) var(--ease-out),
			transform var(--t-ui) var(--ease-out);
	}
	.place:focus-visible .arrow {
		opacity: 1;
		transform: none;
	}
	@media (hover: hover) and (pointer: fine) {
		.places:hover .place {
			color: color-mix(in srgb, var(--color-bg) 45%, var(--color-ink));
		}
		.places .place:hover {
			color: var(--color-bg);
		}
		.place:hover .arrow {
			opacity: 1;
			transform: none;
		}
	}
	.small {
		grid-column: 9 / -1;
		display: grid;
		gap: var(--space-1);
		justify-items: end;
		text-align: right;
		font-size: var(--text-small);
	}
	.name {
		display: flex;
		font-size: 24.5vw;
		line-height: 0.8;
		margin-bottom: -0.16em;
		margin-inline: -0.04em;
		white-space: nowrap;
		overflow: hidden;
		padding-top: 0.04em;
	}
	/* the letters rise into place one after another as the close comes in */
	.name span {
		display: inline-block;
	}
	@media (prefers-reduced-motion: no-preference) {
		.name span {
			transform: translateY(100%);
			transition: transform 1100ms var(--ease-out);
			transition-delay: calc(var(--i) * 60ms);
		}
		.name.risen span {
			transform: none;
		}
	}
	@media (max-width: 720px) {
		.top {
			grid-template-columns: minmax(0, 1fr);
			row-gap: var(--space-5);
		}
		.places,
		.small {
			grid-column: 1;
		}
		.small {
			justify-items: start;
			text-align: left;
		}
	}
</style>
