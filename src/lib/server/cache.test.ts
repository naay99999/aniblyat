import { describe, expect, it, vi } from 'vitest';
import { createCache } from './cache';

describe('createCache', () => {
	it('serves a fresh value without loading again', async () => {
		let t = 0;
		const cached = createCache(10, () => t);
		const load = vi.fn(async () => 'a');
		expect(await cached('k', 1000, load)).toBe('a');
		t = 999;
		expect(await cached('k', 1000, load)).toBe('a');
		expect(load).toHaveBeenCalledTimes(1);
	});

	it('loads again once the value expires', async () => {
		let t = 0;
		const cached = createCache(10, () => t);
		const load = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b');
		await cached('k', 1000, load);
		t = 1000;
		expect(await cached('k', 1000, load)).toBe('b');
	});

	it('shares one request between concurrent misses', async () => {
		const cached = createCache();
		let resolve!: (v: string) => void;
		const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));
		const a = cached('k', 1000, load);
		const b = cached('k', 1000, load);
		resolve('x');
		expect(await Promise.all([a, b])).toEqual(['x', 'x']);
		expect(load).toHaveBeenCalledTimes(1);
	});

	it('serves the expired value when the refresh fails', async () => {
		let t = 0;
		const cached = createCache(10, () => t);
		await cached('k', 1000, async () => 'old');
		t = 5000;
		expect(await cached('k', 1000, () => Promise.reject(new Error('429')))).toBe('old');
	});

	it('rethrows when nothing was cached, and does not remember the failure', async () => {
		const cached = createCache();
		await expect(cached('k', 1000, () => Promise.reject(new Error('down')))).rejects.toThrow(
			'down'
		);
		expect(await cached('k', 1000, async () => 'ok')).toBe('ok');
	});

	it('drops the least recently used entry past its size', async () => {
		const cached = createCache(2);
		const load = vi.fn(async () => 'v');
		await cached('a', 1000, load);
		await cached('b', 1000, load);
		await cached('a', 1000, load); // a is now the most recent
		await cached('c', 1000, load); // evicts b
		await cached('a', 1000, load);
		await cached('b', 1000, load);
		expect(load).toHaveBeenCalledTimes(4);
	});
});
