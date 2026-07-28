<script lang="ts">
	import type { SwappedLetterPaths, TutorialState } from '$lib/types/store';
	import clsx from 'clsx';

	export let alphaState: Map<string, number>;
	export let letter: string;
	export let selected: string[];
	export let tutorialState: TutorialState | undefined;
	export let handleSelect: (l: string) => void;

	$: isAvailable = alphaState.get(letter) || 0 > 0;
	$: alphaStateNumber = alphaState.get(letter) as number;
	$: alphaKeyColorIncluded = selected.includes(letter);
	// TODO - refactor this large variable
	$: isTutorialMode =
		!!tutorialState?.isTutorialMode &&
		letter ===
			Object.keys(tutorialState.steps?.[tutorialState.currentStep].start as SwappedLetterPaths)[0];

	function getArrayFromNum(num: number) {
		const newArr = Array.from({ length: num > 3 ? 3 : num });
		return newArr;
	}
</script>

{#if isAvailable}
	<button on:click={() => handleSelect(letter)} class="key relative flex flex-col items-center">
		<span
			class={clsx(
				'flex w-full flex-col items-center justify-between gap-1 rounded p-1.5 text-[length:clamp(0.875rem,2.8vw,1.875rem)] uppercase transition-colors hover:cursor-pointer sm:p-2',
				{
					'bg-amber-500': alphaKeyColorIncluded,
					'bg-gray-100 dark:bg-gray-100/80': !alphaKeyColorIncluded && !isTutorialMode,
					'animate-pulse bg-amber-500': isTutorialMode && !alphaKeyColorIncluded
				}
			)}
		>
			<p>
				{letter}
			</p>
			<div class="flex items-center gap-1">
				{#if alphaStateNumber === Infinity}
					<span class="block h-1 w-3 bg-black"></span>
				{:else}
					{#each getArrayFromNum(alphaStateNumber) as _u, j ('data-solution-path' + j + '-' + j + '-' + _u)}
						<span class={clsx('block h-1 w-1  bg-black')}></span>
					{/each}
				{/if}
			</div>
		</span>
	</button>
{:else}
	<button
		disabled
		class="key flex flex-col items-center justify-between gap-1 rounded p-1.5 text-[length:clamp(0.875rem,2.8vw,1.875rem)] text-gray-400/50 uppercase transition-colors hover:cursor-pointer sm:p-2 dark:bg-gray-100/10"
		><p>{letter}</p>
		<div class="flex items-center gap-1">
			<span class={clsx('block h-1 w-1')}></span>
		</div></button
	>
{/if}

<style>
	.key {
		width: var(--key-size);
		flex-shrink: 0;
	}
</style>
