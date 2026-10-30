const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	mdash: '—',
	ndash: '–',
	hellip: '…',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“'
};

function decodeEntities(s: string): string {
	return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
		if (code[0] === '#') {
			const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
			return Number.isFinite(n) ? String.fromCodePoint(n) : match;
		}
		return NAMED_ENTITIES[code.toLowerCase()] ?? match;
	});
}

/** AniList descriptions are HTML (`<br>`, `<i>`, entities); turn them into plain text with newlines. */
export function stripHtml(html: string | null): string {
	if (!html) return '';
	const text = html
		.replace(/\s*<br\s*\/?>\s*/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\n{3,}/g, '\n\n');
	return decodeEntities(text).trim();
}

export function displayTitle(t: { english?: string | null; romaji?: string | null }): string {
	return t.english ?? t.romaji ?? '';
}

/**
 * Split text into runs of digits and runs of everything else. Tabular figures belong on the
 * digits only: on a whole string Schibsted Grotesk sets ":" and "." at figure width ("06 : 00").
 */
export function figures(text: string): { text: string; digits: boolean }[] {
	return (text.match(/\d+|\D+/g) ?? []).map((run) => ({ text: run, digits: /^\d/.test(run) }));
}

const FORMATS: Record<string, string> = {
	TV: 'TV',
	TV_SHORT: 'TV Short',
	MOVIE: 'Movie',
	SPECIAL: 'Special',
	OVA: 'OVA',
	ONA: 'ONA',
	MUSIC: 'Music'
};

/** AniList's format enum as one label everywhere: the same words as the season page's groups. */
export function formatLabel(format: string | null | undefined): string | null {
	if (!format) return null;
	return FORMATS[format] ?? format.replaceAll('_', ' ');
}
