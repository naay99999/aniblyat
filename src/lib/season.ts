export type SeasonName = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';
export type Season = { season: SeasonName; year: number };

export const SEASONS: SeasonName[] = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

const MIN_YEAR = 1940;

/** AniList convention: Jan–Mar winter, Apr–Jun spring, Jul–Sep summer, Oct–Dec fall. */
export function currentSeason(date: Date): Season {
	return { season: SEASONS[Math.floor(date.getMonth() / 3)], year: date.getFullYear() };
}

export function shiftSeason(s: Season, delta: number): Season {
	const index = s.year * 4 + SEASONS.indexOf(s.season) + delta;
	return { season: SEASONS[((index % 4) + 4) % 4], year: Math.floor(index / 4) };
}

export function parseSeasonParams(year: string, season: string): Season | null {
	if (!/^\d{4}$/.test(year)) return null;
	const y = Number(year);
	if (y < MIN_YEAR || y > new Date().getFullYear() + 2) return null;
	const name = season.toUpperCase() as SeasonName;
	if (season !== season.toLowerCase() || !SEASONS.includes(name)) return null;
	return { season: name, year: y };
}

export function seasonPath(s: Season): string {
	return `/season/${s.year}/${s.season.toLowerCase()}`;
}

export function seasonLabel(s: Season): string {
	return `${s.season[0]}${s.season.slice(1).toLowerCase()} ${s.year}`;
}

export function sameSeason(a: Season, b: Season): boolean {
	return a.season === b.season && a.year === b.year;
}

export function seasonGrid(now: Date, fromYear = 2000): { year: number; seasons: Season[] }[] {
	const last = shiftSeason(currentSeason(now), 1);
	const rows: { year: number; seasons: Season[] }[] = [];
	for (let year = last.year; year >= fromYear; year--) {
		const seasons = SEASONS.filter(
			(_, i) => year < last.year || i <= SEASONS.indexOf(last.season)
		).map((season) => ({ season, year }));
		rows.push({ year, seasons });
	}
	return rows;
}
