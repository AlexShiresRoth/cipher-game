<script lang="ts">
	import clsx from 'clsx';
	import { onMount } from 'svelte';
	import UpdatePopup from './update-popup.svelte';

	export let selected: string[];
	export let handleSelect: (l: string) => void;
	export let alphaState: Map<string, number>;
	export let alpha: string[];
	export let removeLetterFromSelection: () => void;
	export let guess;
	export let shouldShowInitialTutorial: boolean = true;
	export let tutorialLetterStart: string;

	function toggleUpdatePopup() {}

	$: getAlphaStateNumber = (l: string) => {
		return alphaState.get(l) as number;
	};

	$: checkAlphaKeyColorIncluded = (l: string) => {
		return selected.includes(l);
	};

	$: getArrayFromNum = (num: number) => {
		const newArr = Array.from({ length: num > 3 ? 3 : num });
		return newArr;
	};

	$: isAvailable = (l: string) => {
		const uses = alphaState.get(l) || 0;
		return uses > 0;
	};

	$: checkIfTutorialMode = (l: string) => {
		return shouldShowInitialTutorial && l === tutorialLetterStart;
	};

	onMount(() => {
		window.addEventListener('keyup', (e) => {
			if (alpha.includes(e.key) && isAvailable(e.key)) {
				handleSelect(e.key);
			}
			if (e.key === 'Backspace') {
				removeLetterFromSelection();
			}
			if (e.key === 'Enter') {
				guess();
			}
		});
	});
</script>

<div class="relative flex w-full justify-center">
	<div class="relative flex flex-wrap items-center justify-center gap-2 dark:text-black">
		{#each alpha as l}
			{#if isAvailable(l)}
				<button on:click={() => handleSelect(l)} class="relative flex flex-col items-center">
					{#if checkIfTutorialMode(l)}
						<UpdatePopup alignCarat="bottom-middle" {toggleUpdatePopup} alignClasses=""
							><p class="text-xs dark:text-white">
								To start, let's try swapping <strong class="text-amber-500 uppercase">{l}</strong>
								with
								<strong class="text-amber-500">'need to get the letter'</strong>
							</p></UpdatePopup
						>
					{/if}
					<span
						class={clsx(
							'flex min-w-12 flex-col items-center justify-between gap-2 rounded p-2 text-2xl uppercase transition-colors hover:cursor-pointer md:w-16 md:p-2 md:text-4xl',
							{
								'bg-amber-500': checkAlphaKeyColorIncluded(l),
								'bg-gray-100 dark:bg-gray-100/80':
									!checkAlphaKeyColorIncluded(l) && !checkIfTutorialMode(l),
								'animate-pulse bg-amber-500':
									checkIfTutorialMode(l) && !checkAlphaKeyColorIncluded(l)
							}
						)}
					>
						<p>
							{l}
						</p>
						<div class="flex items-center gap-1">
							{#if getAlphaStateNumber(l) === Infinity}
								<span class="block h-1 w-3 bg-black"></span>
							{:else}
								{#each getArrayFromNum(getAlphaStateNumber(l)) as _len}
									<span class={clsx('block h-1 w-1  bg-black')}></span>
								{/each}
							{/if}
						</div>
					</span>
				</button>
			{:else}
				<button
					disabled
					class={clsx(
						'flex min-w-12 flex-col items-center justify-between gap-2 rounded p-2 text-2xl uppercase transition-colors hover:cursor-pointer md:w-16 md:p-2 md:text-4xl',
						{
							'text-gray-400/50 dark:bg-gray-100/10': !selected.includes(l),
							'bg-amber-300 text-black': selected.includes(l)
						}
					)}
					><p>{l}</p>
					<div class="flex items-center gap-1">
						<span class={clsx('block h-1 w-1')}></span>
					</div></button
				>
			{/if}
		{/each}
	</div>
</div>
