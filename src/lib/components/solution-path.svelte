<script lang="ts">
	import { onMount } from 'svelte';
	import LetterSwapLine from './letter-swap-line.svelte';
	import SolutionStep from './solution-step.svelte';
	type SwappedLetterPaths = { [key: string]: number };
	export let solutionPath: string[] = [];
	export let word: string;
	let swappedLettersPerPath: SwappedLetterPaths[][] = [];
	$: elements = [] as HTMLElement[][];

	function findSwappedLetters(paths: string[]) {
		const swappedLettersPerPath: SwappedLetterPaths[][] = [];

		paths.forEach((path, n) => {
			if (n + 1 < paths.length) {
				const swapped = path
					.split('')
					.map((p, i) => {
						if (p !== paths[n + 1][i]) {
							return { [p]: i };
						}
					})
					.filter(Boolean);

				swappedLettersPerPath.push(swapped as SwappedLetterPaths[]);
			}
		});

		return swappedLettersPerPath;
	}

	function isPathStepPart(index: number, part: string, swappedLetters: SwappedLetterPaths[]) {
		if (!swappedLetters) return false;

		return !!swappedLetters.find((swap) => swap[part] === index);
	}

	function getLetterKey(obj: SwappedLetterPaths) {
		return Object.keys(obj)[0];
	}

	function onCreateNode(node: HTMLElement, data: number) {
		const pairs = [...elements];
		if (pairs[data]) {
			pairs[data].push(node);
		} else {
			pairs[data] = [node];
		}
		elements = pairs;
	}

	onMount(() => {
		swappedLettersPerPath = findSwappedLetters(solutionPath);
	});
</script>

<div class="flex w-full gap-2 pt-2">
	<div class="flex w-full flex-col items-center gap-2">
		{#each solutionPath as path, pathStep}
			<div class="flex w-full flex-col gap-2">
				<p>Step {pathStep + 1}</p>
				<div class="flex w-full gap-2">
					{#each path.split('') as part, i}
						<SolutionStep
							{part}
							{pathStep}
							{isPathStepPart}
							{i}
							{swappedLettersPerPath}
							{word}
							{onCreateNode}
						/>
					{/each}
				</div>

				{#if !!elements.length}
					<LetterSwapLine nodePair={elements[pathStep]} />
				{/if}
			</div>

			{#if !!swappedLettersPerPath[pathStep] && pathStep + 1 < solutionPath.length}
				<div class="flex w-full flex-col items-center">
					<div class="flex items-center gap-2">
						<p>Swap</p>
						<p class="text-amber-500 uppercase">
							{getLetterKey(swappedLettersPerPath[pathStep][0])}
						</p>
						<p>with</p>
						<p class="text-amber-500 uppercase">
							{getLetterKey(swappedLettersPerPath[pathStep][1])}
						</p>
					</div>
				</div>
			{:else}
				<div class="flex w-full flex-col items-center"><p>Done 🎉</p></div>
			{/if}
		{/each}
	</div>
</div>
