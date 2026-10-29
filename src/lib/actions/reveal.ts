import type { Action } from 'svelte/action';

let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver | undefined {
	if (typeof IntersectionObserver === 'undefined') return undefined;
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					e.target.classList.add('is-in');
					observer?.unobserve(e.target);
				}
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.1 }
	);
	return observer;
}

/** Rise-in once when the element enters the viewport; `index` staggers siblings. */
export const reveal: Action<HTMLElement, number | undefined> = (node, index = 0) => {
	node.dataset.reveal = '';
	node.style.setProperty('--i', String(index));
	const io = getObserver();
	if (io) io.observe(node);
	else node.classList.add('is-in');
	return {
		destroy() {
			io?.unobserve(node);
		}
	};
};
