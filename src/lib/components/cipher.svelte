<script lang="ts">
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';

	export let selected: string[];
	export let cipherState: string[];
	export let allowChooseIndex: boolean;
	export let startIndex: number;
	export let indexToSwap: number;
	export let word: string;
	export let chooseStartingIndex;

	// $: console.log('selected cipher', selected, startIndex, indexToSwap);

	// check if duplicate letters should highlight
	$: handleSelectedLetter = (key: string) => {
		return allowChooseIndex && cipherState.filter(() => key === selected[0]).length > 1;
	};

	$: highlightAtStartIndex = (i: number) => {
		return startIndex === i;
	};

	$: highlightAtSwapIndex = (i: number) => {
		return indexToSwap === i;
	};

	$: highlightAtCorrectPosition = (i: number) => {
		return word.split('')[i] === cipherState[i];
	};

	$: defaultCipherDisplay = (i: number, key: string) => {
		return (
			startIndex !== i &&
			word.split('')[i] !== cipherState[i] &&
			indexToSwap !== i &&
			cipherState.filter(() => key === selected[0]).length === 1
		);
	};
</script>

<div class="mb-8 flex w-full max-w-full justify-center gap-2">
	{#each cipherState as key, i (`${key}-${i}`)}
		<button
			on:click={() => chooseStartingIndex(i)}
			in:fly={{ y: i % 2 === 0 ? -50 : 50, duration: 400 }}
			class={clsx(
				'relative z-0 flex min-w-8 items-center justify-center border-2 p-2 transition-all md:min-w-16',
				{
					'border-emerald-500 text-emerald-500':
						highlightAtCorrectPosition(i) &&
						!handleSelectedLetter(key) &&
						!highlightAtStartIndex(i),
					'border-black dark:border-white dark:text-white': defaultCipherDisplay(i, key),
					'animate-bounce border-amber-500 text-amber-500 hover:cursor-pointer':
						handleSelectedLetter(key),
					'border-amber-500 text-amber-500': highlightAtStartIndex(i),
					'border-indigo-500 text-indigo-500': highlightAtSwapIndex(i) && !handleSelectedLetter(key)
				}
			)}
		>
			<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
			{#if handleSelectedLetter(key)}
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
	{/each}
</div>
