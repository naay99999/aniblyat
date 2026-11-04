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

function parseHex(hex: string): [number, number, number] | null {
	const m = /^#([0-9a-f]{6})$/i.exec(hex);
	if (!m) return null;
	return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255) as [number, number, number];
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

// the hero ground: AniList's accent kept for its hue only, pressed down to a deep, quiet tone
const GROUND_L = 0.22;
const GROUND_MAX_C = 0.04;

/**
 * A dark ground for the hero from AniList's `coverImage.color`. That colour is the cover's loudest
 * accent, too bright to fill a screen; this keeps its hue (OKLCH) at a fixed low lightness and a
 * capped chroma, so every title gets a calm field its banner can fade into.
 */
export function heroGround(color: string | null | undefined): string {
	const rgb = (color && parseHex(color)) || parseHex('#dedad3')!;
	const [r, g, b] = rgb.map(toLinear);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	const chroma = Math.hypot(A, B);
	const k = chroma > GROUND_MAX_C ? GROUND_MAX_C / chroma : 1;
	const [a2, b2] = [A * k, B * k];
	const l2 = (GROUND_L + 0.3963377774 * a2 + 0.2158037573 * b2) ** 3;
	const m2 = (GROUND_L - 0.1055613458 * a2 - 0.0638541728 * b2) ** 3;
	const s2 = (GROUND_L - 0.0894841775 * a2 - 1.291485548 * b2) ** 3;
	const out = [
		4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2,
		-1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2,
		-0.0041960863 * l2 - 0.7034186147 * m2 + 1.707614701 * s2
	];
	return (
		'#' +
		out
			.map((c) => Math.round(Math.min(1, Math.max(0, fromLinear(c))) * 255))
			.map((c) => c.toString(16).padStart(2, '0'))
			.join('')
	);
}

/** Text colour with the better WCAG contrast on a flat ground (AniList `coverImage.color`). */
export function inkOn(ground: string | null | undefined): string {
	const l = ground ? luminance(ground) : null;
	if (l == null) return DARK;
	const onDark = (l + 0.05) / (0.0033 + 0.05);
	const onLight = 1.05 / (l + 0.05);
	return onDark >= onLight ? DARK : LIGHT;
}
