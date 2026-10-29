/** Progress (0–1) through a tall wrapper whose child is `position: sticky` for its height. */
export function pinProgress(rectTop: number, height: number, viewport: number): number {
	const travel = height - viewport;
	if (travel <= 0) return 0;
	return Math.min(1, Math.max(0, -rectTop / travel));
}

export function activeIndex(progress: number, count: number): number {
	if (count <= 0) return 0;
	return Math.min(count - 1, Math.floor(progress * count));
}
