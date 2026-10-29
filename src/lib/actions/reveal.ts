import type { Action } from 'svelte/action';

const pending = new Set<HTMLElement>();
let frame = 0;
let listening = false;

function check() {
	frame = 0;
	const line = window.innerHeight * 0.88;
	for (const node of pending) {
		// reveal what has entered the screen, and anything a fast scroll or jump has already passed
		if (node.getBoundingClientRect().top < line) {
			node.classList.add('is-in');
			pending.delete(node);
		}
	}
}

function schedule() {
	if (!frame) frame = requestAnimationFrame(check);
}

function listen() {
	if (listening) return;
	listening = true;
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
}

/** Rise-in once when the element reaches the lower part of the screen; `index` staggers siblings. */
export const reveal: Action<HTMLElement, number | undefined> = (node, index = 0) => {
	node.dataset.reveal = '';
	node.style.setProperty('--i', String(index));
	pending.add(node);
	listen();
	schedule();
	return {
		destroy() {
			pending.delete(node);
		}
	};
};
