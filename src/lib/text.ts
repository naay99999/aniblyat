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
