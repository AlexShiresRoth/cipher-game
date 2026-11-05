<script lang="ts">
	import { findSwappedLetters } from '$lib';
	import { onMount } from 'svelte';
	import LetterSwapLine from './letter-swap-line.svelte';
	import SolutionStep from './solution-step.svelte';
	type SwappedLetterPaths = { [key: string]: number };
	export let solutionPath: string[] = [];
	export let word: string;
	export let guesses: string[] | undefined;

	let swappedLettersPerPath: SwappedLetterPaths[][] = [];

	let elements = [] as HTMLElement[][];

	function isPathStepPart(index: number, part: string, swappedLetters: SwappedLetterPaths[]) {
		if (!swappedLetters) return false;

		return !!swappedLetters.find((swap) => swap[part] === index);
	}

	function getLetterKey(obj: SwappedLetterPaths) {
		return Object.keys(obj)[0];
	}

	function getLetter(pathStep: number, index: number) {
		return getLetterKey(swappedLettersPerPath[pathStep][index]);
	}

	function getLetterSwaps(pathStep: number) {
		const letterA = getLetter(pathStep, 0);
		const letterB = getLetter(pathStep, 1);

		const guess = guesses?.[pathStep]?.[0];

		if (!guess) {
			return [letterA, letterB];
		}

		return guess === letterA ? [letterA, letterB] : [letterB, letterA];
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

<div class="solution-path flex w-full gap-2 pt-2">
	<div class="flex w-full flex-col items-center gap-2">
		{#each solutionPath as path, pathStep (pathStep)}
			<div class="solution-card" class:solution-complete={pathStep === solutionPath.length - 1}>
				{#if pathStep + 1 < solutionPath.length}
					{#if guesses?.[pathStep]}
						<div class="solution-guess flex items-center">
							<p>
								<span class="font-bold text-amber-500">
									{guesses?.[pathStep]?.toUpperCase()}
								</span>
							</p>
						</div>
					{/if}
					<div class="solution-card-heading flex w-full items-center justify-between">
						<p>
							Move {pathStep + 1}
						</p>
						{#if !!swappedLettersPerPath[pathStep] && pathStep + 1 < solutionPath.length}
							<div class="flex flex-col items-center">
								<div class="flex items-center gap-2">
									<p>Swap</p>

									<p class="text-amber-500 uppercase">
										{getLetterSwaps(pathStep)[0]}
									</p>

									<p>and</p>

									<p class="text-amber-500 uppercase">
										{getLetterSwaps(pathStep)[1]}
									</p>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<p class="solution-done">Cipher solved <span aria-hidden="true">✓</span></p>
				{/if}
				<div class="solution-letter-row flex w-full gap-2">
					{#each path.split('') as part, i (i)}
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
		{/each}
	</div>
</div>
