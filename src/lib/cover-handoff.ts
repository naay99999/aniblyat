/**
 * The cover a reader picks carries over to the poster on the title's page. Only the picked
 * picture gets the transition name, so a title shown twice on one page cannot break it.
 */
let picked: HTMLImageElement | null = null;

/** Mark the picture for the next navigation (for moves that are not plain link clicks). */
export function handOff(img: HTMLImageElement | null | undefined): void {
	picked = img ?? null;
}

/** The picture that belongs to a clicked link: inside it, or the marked one in its card. */
export function coverFor(link: HTMLAnchorElement): HTMLImageElement | null {
	return (
		link.querySelector<HTMLImageElement>('img') ??
		link.closest('article, li, section')?.querySelector<HTMLImageElement>('img[data-cover]') ??
		null
	);
}

/** Take the picture marked for this move, if any. */
export function takeHandOff(): HTMLImageElement | null {
	const img = picked;
	picked = null;
	return img?.isConnected ? img : null;
}
