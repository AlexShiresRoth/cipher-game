<script lang="ts">
	import type { TutorialState } from '$lib/types/store';
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';
	export let key: string;
	export let i: number;
	export let selected: string[];
	export let cipherState: string[];
	export let allowChooseIndex: boolean;
	export let startIndex: number;
	export let indexToSwap: number;
	export let chooseStartingIndex: (i: number) => void;
	export let word: string;
	export let tutorialState: TutorialState | undefined;

	$: currentStep = tutorialState?.steps?.[tutorialState.currentStep];
	$: start = Object.values(currentStep?.start || {})[0] ?? -1;
	$: end = Object.values(currentStep?.end || {})[0] ?? -1;
	$: selectedLetter = allowChooseIndex && cipherState.filter(() => key === selected[0]).length > 1;
	$: highlightAtCorrectPosition = word.split('')[i] === cipherState[i];
	$: highlightAtStartIndex = startIndex === i;
	$: highlightAtSwapIndex = indexToSwap === i;
	$: defaultCipherDisplay =
		startIndex !== i &&
		word.split('')[i] !== cipherState[i] &&
		indexToSwap !== i &&
		cipherState.filter(() => key === selected[0]).length === 1;
</script>

<button
	on:click={() => chooseStartingIndex(i)}
	in:fly={{ y: i % 2 === 0 ? -50 : 50, duration: 400 }}
	class={clsx(
		'relative z-0 flex min-w-8 items-center justify-center border-2 p-2 transition-all md:min-w-16',
		{
			'border-emerald-500 text-emerald-500':
				highlightAtCorrectPosition && !selectedLetter && !highlightAtStartIndex,
			'border-black dark:border-white dark:text-white': defaultCipherDisplay,
			'animate-bounce border-amber-500 text-amber-500 hover:cursor-pointer': selectedLetter,
			'border-amber-500 text-amber-500': highlightAtStartIndex,
			'border-indigo-500 text-indigo-500': highlightAtSwapIndex && !selectedLetter
		}
	)}
>
	{#if tutorialState?.isTutorialMode && start === i}
		{#key tutorialState.currentStep}
			<span
				in:fly={{ y: -50, delay: 500 }}
				class="absolute -top-5 z-10 flex flex-col items-center justify-center text-xs uppercase dark:text-white"
				>start</span
			>
		{/key}
	{/if}
	{#if tutorialState?.isTutorialMode && end === i}
		{#key tutorialState.currentStep}
			<span
				in:fly={{ y: -50 }}
				class="absolute -top-5 z-10 flex flex-col items-center justify-center text-xs uppercase dark:text-white"
				>end</span
			>
		{/key}
	{/if}
	<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
	{#if selectedLetter}
		<div
			class="absolute -bottom-10 z-10 flex flex-col items-center justify-center"
			transition:fly={{ y: 20 }}
		>
			<span class="text-xs text-amber-500 uppercase">Press here</span>
		</div>
	{/if}
	{#if startIndex === i && !allowChooseIndex}
		<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
			<span class="text-xs text-amber-500 uppercase">{cipherState[indexToSwap]}</span>
		</div>
	{/if}
	{#if indexToSwap === i && !allowChooseIndex}
		<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
			<span class="text-xs text-indigo-500 uppercase">{selected[0]}</span>
		</div>
	{/if}
</button>
