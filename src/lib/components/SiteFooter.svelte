<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { homePath, listPath, seasonHref, seasonsPath } from '../paths';
	import { currentSeason } from '../season';

	const links = [
		{ href: homePath(), label: m.nav_home() },
		{ href: seasonHref(currentSeason(new Date())), label: m.nav_season() },
		{ href: seasonsPath(), label: m.nav_seasons() },
		{ href: listPath(), label: m.nav_list() }
	];
</script>

<footer class="footer page">
	<ul class="places">
		{#each links as link (link.href)}
			<li><a href={link.href} class="link">{link.label}</a></li>
		{/each}
	</ul>
	<div class="small">
		<p>
			{m.footer_note()} ·
			<a href="https://anilist.co" class="link" rel="external noopener">anilist.co</a>
		</p>
		<a href="#main" class="link">{m.footer_top()}</a>
	</div>
	<p class="name display" aria-hidden="true">aniblyat</p>
</footer>

<style>
	.footer {
		display: grid;
		gap: 72px;
		padding-top: 120px;
		overflow: hidden;
		background: var(--color-ink);
		color: var(--color-bg);
	}
	.places {
		display: grid;
		gap: 4px;
		font-size: var(--text-lead);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--color-accent-200);
	}
	.small {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		font-size: var(--text-small);
	}
	.name {
		font-size: 24.5vw;
		line-height: 0.8;
		margin-bottom: -0.16em;
		margin-inline: -0.04em;
		white-space: nowrap;
	}
</style>
