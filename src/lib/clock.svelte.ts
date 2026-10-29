const nowSec = () => Math.floor(Date.now() / 1000);

class Clock {
	now = $state(nowSec());

	constructor(intervalMs = 60_000) {
		if (typeof window !== 'undefined') {
			setInterval(() => (this.now = nowSec()), intervalMs);
		}
	}
}

/** Shared wall clock in unix seconds; re-renders countdowns once a minute. */
export const clock = new Clock();
