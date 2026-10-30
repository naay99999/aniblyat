import { getHome, getSeason } from '#lib/anilist/queries.js';
import { currentSeason, sameSeason, type Season } from '#lib/season.js';
import { cached } from './cache';

// One key per AniList read, so every page that needs it shares the same server copy.

const HOME_TTL = 120_000;
const ON_AIR_TTL = 10 * 60_000;
// a season that has ended barely changes: keep it longer
const PAST_TTL = 6 * 60 * 60_000;

export const cachedHome = () =>
	cached('home', HOME_TTL, async () => ({
		value: await getHome(new Date(), { maxRetries: 0 }),
		at: Date.now()
	}));

export const cachedSeason = (season: Season) =>
	cached(
		`season:${season.year}:${season.season}`,
		sameSeason(season, currentSeason(new Date())) ? ON_AIR_TTL : PAST_TTL,
		async () => ({ media: await getSeason(season, { maxRetries: 0 }), at: Date.now() })
	);
