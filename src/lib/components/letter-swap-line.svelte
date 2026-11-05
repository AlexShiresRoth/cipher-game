<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	export let nodePair: HTMLElement[] = [];

	let line = new SvelteMap<string, number>();
	let container: HTMLElement;

	function updateLine(ref1: HTMLElement, ref2: HTMLElement) {
		const newLineMap = new SvelteMap<string, number>([...line]);
		if (!container || !ref1 || !ref2) return newLineMap;
		const cr = container.getBoundingClientRect();

		const r1 = ref1.getBoundingClientRect();
		const r2 = ref2.getBoundingClientRect();

		newLineMap.set('x1', r1.left + r1.width / 2 - cr.left);
		newLineMap.set('x2', r2.left + r2.width / 2 - cr.left);

		return newLineMap;
	}

	$: if (container && nodePair.length >= 2) {
		line = updateLine(nodePair[0], nodePair[1]);
	}

	function observeSize(node: HTMLElement) {
		const observer = new ResizeObserver(() => {
			if (nodePair.length >= 2) line = updateLine(nodePair[0], nodePair[1]);
		});
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

{#if nodePair.length > 0}
	<div class="solution-connector" bind:this={container} use:observeSize>
		<svg
			class="pointer-events-none inset-0 flex items-center justify-center"
			data-testid="line-svg"
			width="100%"
			height="28"
			aria-hidden="true"
		>
			<line
				x1={line.get('x1')}
				y1={14}
				x2={line.get('x2')}
				y2={14}
				class="fill-amber-500 stroke-amber-500 stroke-2"
			/>
			<circle
				cx={((line.get('x1') ?? 0) + (line.get('x2') ?? 0)) / 2}
				cy={14}
				r="14"
				class="solution-connector-center"
			/>
			<g
				transform={`
			translate(${((line.get('x1') ?? 0) + (line.get('x2') ?? 0)) / 2},
			          ${14})
			translate(-12, -12)
		`}
				stroke="currentColor"
				fill="none"
				class="text-amber-500"
				stroke-width="2"
			>
				<path d="M8 3 4 7l4 4" />
				<path d="M4 7h16" />
				<path d="m16 21 4-4-4-4" />
				<path d="M20 17H4" />
			</g>
		</svg>
	</div>
{/if}
