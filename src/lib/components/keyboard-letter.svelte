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
				'flex w-full flex-col items-center justify-between gap-1.5 rounded-lg rounded-bl-none p-2 text-[clamp(1.125rem,3.2vw,1.75rem)] uppercase transition-colors hover:cursor-pointer sm:p-2.5',
				{
					'bg-purple': alphaKeyColorIncluded,
					'dark:bg-keyboard dark:text-primary bg-gray-100':
						!alphaKeyColorIncluded && !isTutorialMode,
					'bg-purple animate-pulse': isTutorialMode && !alphaKeyColorIncluded
				}
			)}
		>
			<p>
				{letter}
			</p>
			<div class="flex items-center gap-1">
				{#if alphaStateNumber === Infinity}
					<span class="block h-1 w-3 bg-current"></span>
				{:else}
					{#each getArrayFromNum(alphaStateNumber) as _u, j ('data-solution-path' + j + '-' + j + '-' + _u)}
						<span class="block h-1 w-1 bg-current"></span>
					{/each}
				{/if}
			</div>
		</span>
	</button>
{:else}
	<button
		disabled
		class="key flex flex-col items-center justify-between gap-1.5 rounded-md p-2 text-[clamp(1.125rem,3.2vw,1.75rem)] text-gray-400/50 uppercase transition-colors hover:cursor-pointer sm:p-2.5 dark:bg-gray-100/10"
		><p>{letter}</p>
		<div class="flex items-center gap-1">
			<span class={clsx('block h-1 w-1')}></span>
		</div></button
	>
{/if}

<style>
	.key {
		width: var(--key-size);
		min-height: min(calc(var(--key-size) * 1.15), 3.25rem);
		flex-shrink: 0;
	}
</style>
