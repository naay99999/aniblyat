import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';

export type FuzzyDate = { year: number | null; month: number | null; day: number | null };

export type AiringInput = {
	status: string | null;
	nextAiringEpisode: { episode: number; airingAt: number } | null;
	startDate: FuzzyDate | null;
};

export type AiringStatus =
	| { kind: 'next'; episode: number; airingAt: number; secondsLeft: number }
	| { kind: 'airing' }
	| { kind: 'upcoming'; startDate: FuzzyDate | null }
	| { kind: 'finished' }
	| { kind: 'hiatus' }
	| { kind: 'cancelled' }
	| { kind: 'unknown' };

/** Intl locale for the active UI language; Thai always uses Gregorian years. */
export function intlLocale(): string {
	return getLocale() === 'th' ? 'th-TH-u-ca-gregory' : 'en-GB';
}

export function airingStatus(media: AiringInput, nowSec: number): AiringStatus {
	const next = media.nextAiringEpisode;
	if (media.status === 'RELEASING' && next) {
		return {
			kind: 'next',
			episode: next.episode,
			airingAt: next.airingAt,
			secondsLeft: Math.max(0, next.airingAt - nowSec)
		};
	}
	switch (media.status) {
		case 'RELEASING':
			return { kind: 'airing' };
		case 'NOT_YET_RELEASED':
			return { kind: 'upcoming', startDate: media.startDate };
		case 'FINISHED':
			return { kind: 'finished' };
		case 'HIATUS':
			return { kind: 'hiatus' };
		case 'CANCELLED':
			return { kind: 'cancelled' };
		default:
			return { kind: 'unknown' };
	}
}

export function formatCountdown(seconds: number): string {
	if (seconds <= 0) return m.countdown_now();
	const totalMinutes = Math.ceil(seconds / 60);
	const days = Math.floor(totalMinutes / 1440);
	const hours = Math.floor((totalMinutes % 1440) / 60);
	const minutes = totalMinutes % 60;
	if (days > 0) return m.countdown_days({ days, hours });
	if (hours > 0) return m.countdown_hours({ hours, minutes });
	return m.countdown_minutes({ minutes });
}

export function formatAirTime(airingAt: number, locale = intlLocale(), tz?: string): string {
	const parts = new Intl.DateTimeFormat(locale, {
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
		timeZone: tz
	}).formatToParts(new Date(airingAt * 1000));
	const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
	return `${get('weekday')} ${get('hour')}:${get('minute')}`;
}

export function formatFuzzyDate(d: FuzzyDate | null, locale = intlLocale()): string | null {
	if (!d?.year) return null;
	if (!d.month) return String(d.year);
	const date = new Date(Date.UTC(d.year, d.month - 1, d.day ?? 1));
	return new Intl.DateTimeFormat(locale, {
		day: d.day ? 'numeric' : undefined,
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}

export function statusLabel(s: AiringStatus): string {
	switch (s.kind) {
		case 'next':
			return m.status_next({ episode: s.episode, countdown: formatCountdown(s.secondsLeft) });
		case 'airing':
			return m.status_airing();
		case 'upcoming': {
			const date = formatFuzzyDate(s.startDate);
			return date ? m.status_upcoming_date({ date }) : m.status_upcoming_tba();
		}
		case 'finished':
			return m.status_finished();
		case 'hiatus':
			return m.status_hiatus();
		case 'cancelled':
			return m.status_cancelled();
		default:
			return m.status_unknown();
	}
}
