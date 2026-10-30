<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	let { id, title }: { id: string; title: string } = $props();

	// the clip loads only when the band comes near, and never for reduced motion or saved data
	let node: HTMLElement;
	let frame = $state<HTMLIFrameElement>();
	let live = $state(false);
	let ready = $state(false);
	let paused = $state(false);
	let inView = false;

	const send = (func: 'playVideo' | 'pauseVideo') =>
		frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');

	$effect(() => {
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
			?.saveData;
		if (still || saving) return;
		const io = new IntersectionObserver(
			([e]) => {
				inView = e.isIntersecting;
				if (inView) live = true;
				// off screen it rests; back on screen it carries on unless the reader paused it
				if (ready && !paused) send(inView ? 'playVideo' : 'pauseVideo');
			},
			{ rootMargin: '200px 0px' }
		);
		io.observe(node);
		return () => io.disconnect();
	});

	function toggle() {
		paused = !paused;
		send(paused ? 'pauseVideo' : 'playVideo');
	}
</script>

<div class="loop" bind:this={node}>
	{#if live}
		<iframe
			bind:this={frame}
			class:ready
			src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1&mute=1&loop=1&playlist={id}&controls=0&playsinline=1&rel=0&disablekb=1&iv_load_policy=3&enablejsapi=1"
			title="{m.detail_trailer()} · {title}"
			tabindex="-1"
			aria-hidden="true"
			allow="autoplay; encrypted-media"
			onload={() => {
				// YouTube shows its own title and spinner first; let the picture take over after them
				setTimeout(() => (ready = true), 1200);
			}}
		></iframe>
		{#if ready}
			<button type="button" class="toggle" onclick={toggle}>
				{paused ? m.video_play() : m.video_pause()}
			</button>
		{/if}
	{/if}
</div>

<style>
	.loop {
		position: absolute;
		inset: 0;
		overflow: hidden;
		container-type: size;
	}
	/* a 16:9 clip filling a wide band: as wide as the band, cropped top and bottom */
	iframe {
		position: absolute;
		top: 50%;
		left: 50%;
		width: max(100cqw, calc(100cqh * 16 / 9));
		aspect-ratio: 16 / 9;
		border: 0;
		pointer-events: none;
		opacity: 0;
		transform: translate(-50%, -50%) scale(1.02);
		transition: opacity var(--t-scene) var(--ease-out);
	}
	iframe.ready {
		opacity: 1;
	}
	.toggle {
		position: absolute;
		right: var(--gutter);
		bottom: 16px;
		min-height: 36px;
		padding: 0 14px;
		background: var(--color-ink);
		color: var(--color-bg);
		font-size: var(--text-small);
		font-weight: 600;
		transition: transform var(--t-press) var(--ease-out);
	}
	.toggle:active {
		transform: scale(0.96);
	}
</style>
