<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { AiringEntry } from '../anilist/queries';
	import { reveal } from '../actions/reveal';
	import { formatAirTime, formatCountdown, groupByDay } from '../airing';
	import { clock } from '../clock.svelte';
	import { animePath } from '../paths';
	import { displayTitle } from '../text';

	let { entries }: { entries: AiringEntry[] } = $props();

	const upcoming = $derived(entries.filter((e) => e.airingAt > clock.now));
	const days = $derived(groupByDay(upcoming, clock.now));
	const time = (sec: number) => formatAirTime(sec).split(' ').at(-1);
</script>

<section class="lineup page" aria-labelledby="lineup-title">
	<h2 id="lineup-title" class="head" use:reveal>{m.home_airing_title()}</h2>
	{#if days.length === 0}
		<p class="empty">{m.home_airing_empty()}</p>
	{:else}
		<table>
			<thead class="sr-only">
				<tr>
					<th scope="col">{m.col_title()}</th>
					<th scope="col">{m.col_format()}</th>
					<th scope="col">{m.col_episode()}</th>
					<th scope="col">{m.col_time()}</th>
				</tr>
			</thead>
			{#each days as day (day.day)}
				<tbody>
					<tr class="day">
						<th colspan="4" scope="colgroup">
							{day.day === 'today' ? m.day_today() : m.day_tomorrow()}
						</th>
					</tr>
					{#each day.items as entry (entry.media.id + ':' + entry.episode)}
						<tr>
							<td class="name">
								<a href={animePath(entry.media.id)} class="show">
									{#if entry.media.coverImage?.large}
										<img
											src={entry.media.coverImage.large}
											alt=""
											width="40"
											height="60"
											loading="lazy"
										/>
									{:else}
										<span class="thumb-blank"></span>
									{/if}
									<span class="show-title">{displayTitle(entry.media.title ?? {})}</span>
								</a>
							</td>
							<td class="soft">{entry.media.format?.replace('_', ' ') ?? ''}</td>
							<td class="tabular">EP {entry.episode}</td>
							<td class="when tabular">
								<span>{time(entry.airingAt)}</span>
								<span class="soft">{formatCountdown(entry.airingAt - clock.now)}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			{/each}
		</table>
	{/if}
</section>

<style>
	.lineup {
		padding-block: var(--section);
		background: var(--color-surface);
	}
	.head {
		font-size: var(--text-section);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		margin-bottom: var(--space-4);
	}
	.empty {
		font-size: var(--text-lead);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		line-height: 1.4;
	}
	td {
		vertical-align: middle;
		padding: 10px 0;
	}
	.name {
		font-weight: 600;
	}
	.show {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.show img,
	.thumb-blank {
		flex: none;
		width: 40px;
		height: 60px;
		object-fit: cover;
		background: var(--color-bg);
		transition: transform var(--t-ui) var(--ease-out);
	}
	.show-title {
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.2em;
		text-decoration-thickness: 0.07em;
		transition: text-decoration-color var(--t-hover) ease;
	}
	@media (hover: hover) and (pointer: fine) {
		.show:hover .show-title {
			text-decoration-color: currentColor;
		}
		.show:hover img {
			transform: scale(1.06);
		}
	}
	.name {
		width: 48%;
		padding-right: 24px;
	}
	td:nth-child(2) {
		width: 18%;
		white-space: nowrap;
	}
	td:nth-child(3) {
		width: 14%;
	}
	.when {
		text-align: right;
		white-space: nowrap;
	}
	.when span + span {
		margin-left: 0.5em;
	}
	.soft {
		color: var(--color-muted);
	}
	.day th {
		position: sticky;
		top: var(--bar-shown, 0px);
		transition: top 360ms var(--ease-out);
		z-index: 1;
		padding: var(--space-5) 0 var(--space-2);
		background: var(--color-surface);
		color: var(--color-accent-text);
		font-size: var(--text-lead);
		font-weight: 700;
		letter-spacing: -0.02em;
		text-align: left;
	}
	tbody:first-of-type .day th {
		padding-top: 0;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (max-width: 720px) {
		table,
		tbody,
		tr,
		td {
			display: block;
		}
		tr:not(.day) {
			display: grid;
			grid-template-columns: auto auto 1fr;
			column-gap: 12px;
			margin-bottom: var(--space-3);
		}
		.name {
			grid-column: 1 / -1;
			width: auto;
			line-height: 1.3;
			padding: 0;
		}
		.show {
			gap: 12px;
		}
		td:not(.name) {
			padding: 0;
		}
		td:nth-child(2) {
			padding-left: 52px;
		}
		td:not(.name) {
			width: auto;
			font-size: var(--text-small);
			color: var(--color-muted);
		}
		.day {
			display: block;
		}
		.day th {
			display: block;
			padding-top: var(--space-4);
		}
	}
</style>
