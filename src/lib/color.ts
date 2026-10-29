const DARK = '#0a0a0a';
const LIGHT = '#ffffff';

function luminance(hex: string): number | null {
	const m = /^#([0-9a-f]{6})$/i.exec(hex);
	if (!m) return null;
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Text colour with the better WCAG contrast on a flat ground (AniList `coverImage.color`). */
export function inkOn(ground: string | null | undefined): string {
	const l = ground ? luminance(ground) : null;
	if (l == null) return DARK;
	const onDark = (l + 0.05) / (0.0033 + 0.05);
	const onLight = 1.05 / (l + 0.05);
	return onDark >= onLight ? DARK : LIGHT;
}
