import type { Action } from 'svelte/action';
import { pinProgress } from '../scroll';

/** Report scroll progress (0–1) through a tall wrapper that holds a sticky stage. Never hijacks scrolling. */
export const pinProgressAction: Action<HTMLElement, (progress: number) => void> = (
	node,
	onProgress
) => {
	let callback = onProgress;
	let frame = 0;
	const update = () => {
		frame = 0;
		const rect = node.getBoundingClientRect();
		callback?.(pinProgress(rect.top, rect.height, window.innerHeight));
	};
	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	update();
	return {
		update(next) {
			callback = next;
			schedule();
		},
		destroy() {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		}
	};
};
