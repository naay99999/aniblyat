import type { Action } from 'svelte/action';

export type BarTint = { bg: string; ink: string };

/** While the node sits behind the sticky site bar, give the bar this field and ink. */
export const barTint: Action<HTMLElement, BarTint> = (node, tint) => {
	let current = tint;
	let under = false;
	const root = document.documentElement.style;
	const apply = () => {
		if (under) {
			root.setProperty('--bar-bg', current.bg);
			root.setProperty('--bar-ink', current.ink);
		} else {
			root.removeProperty('--bar-bg');
			root.removeProperty('--bar-ink');
		}
	};
	// the root shrinks to the top edge: intersecting while the node is behind the bar
	const io = new IntersectionObserver(
		([e]) => {
			under = e.isIntersecting;
			apply();
		},
		{ rootMargin: '0px 0px -100% 0px' }
	);
	io.observe(node);
	return {
		update(next) {
			current = next;
			apply();
		},
		destroy() {
			io.disconnect();
			under = false;
			apply();
		}
	};
};
