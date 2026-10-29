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
						<tr use:reveal>
							<td class="name">
								<a href={animePath(entry.media.id)} class="link"
									>{displayTitle(entry.media.title ?? {})}</a
								>
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
		padding-block: 160px 120px;
		background: var(--color-surface);
	}
	.head {
		font-size: var(--text-head);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1;
		margin-bottom: 48px;
	}
	.empty {
		font-size: var(--text-lead);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: clamp(20px, 2.1vw, 30px);
		line-height: 1.5;
		letter-spacing: -0.02em;
	}
	td {
		vertical-align: baseline;
		padding: 0;
	}
	.name {
		width: 48%;
		padding-right: 24px;
	}
	td:nth-child(2) {
		width: 18%;
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
		top: 0;
		z-index: 1;
		padding: 72px 0 20px;
		background: var(--color-surface);
		color: var(--color-accent);
		font-weight: 400;
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
		.lineup {
			padding-block: 96px 80px;
		}
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
			margin-bottom: 18px;
		}
		.name {
			grid-column: 1 / -1;
			width: auto;
			font-size: 22px;
			line-height: 1.3;
			padding: 0;
		}
		td:not(.name) {
			width: auto;
			font-size: 14px;
			color: var(--color-muted);
		}
		.day {
			display: block;
		}
		.day th {
			display: block;
			font-size: 22px;
			padding-top: 40px;
		}
	}
</style>
