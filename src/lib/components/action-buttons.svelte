<script lang="ts">
	import { ArrowLeft, RotateCcw, Trash } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fade } from 'svelte/transition';

	export let clearUsedLetters: () => void;
	export let usedLetters: string[];
	export let showUpdatePopup: boolean;
	export let toggleUpdatePopup;
	export let clearSelection;
	export let selected: string[];
	export let removeLetterFromSelection: () => void;
	export let guess: () => void;
</script>

<div data-testid="button-rows" class="my-8 flex w-full items-center justify-between gap-4">
	<div class="flex items-center gap-4">
		<div class="relative flex items-center">
			<button
				data-testid="replenish-keyboard"
				on:click={() => {
					if (usedLetters.length > 0) {
						clearUsedLetters();
					}
				}}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60':
						usedLetters.length === 0,
					' bg-amber-500 text-white': usedLetters.length > 0
				})}><RotateCcw size={23} /></button
			>
			{#if showUpdatePopup}
				<button
					data-testid="update-popup-reps"
					transition:fade
					class="absolute bottom-full w-[250px] rounded border border-black/10 bg-white p-4 shadow-md after:absolute
							after:top-full after:left-4 after:-translate-x-1/2 after:border-8
							after:border-transparent after:border-t-white
							hover:cursor-pointer dark:border-gray-100/50 dark:bg-black after:dark:border-t-black"
					on:click={() => toggleUpdatePopup(showUpdatePopup)}
				>
					<p
						class="absolute -top-3 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-100/50 bg-white text-xs dark:bg-black"
					>
						X
					</p>
					<p class="text-xs">
						<strong class="text-amber-500">UPDATE</strong>:{` `} New Replenish button—use this to regain
						unavailable letters. Using it costs a move.
					</p>
				</button>
			{/if}
		</div>
		<div>
			<button
				data-testid="clear-selection"
				on:click={() => {
					if (selected.length > 0) {
						clearSelection();
					}
				}}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length === 0,
					'bg-black text-white dark:bg-indigo-500': selected.length > 0
				})}><Trash size={23} /></button
			>
		</div>
		<div>
			<button
				data-testid="delete-letter"
				on:click={removeLetterFromSelection}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length === 0,
					'bg-black text-white dark:bg-indigo-500': selected.length > 0
				})}><ArrowLeft size={23} /></button
			>
		</div>
	</div>
	<div>
		<button
			data-testid="guess-btn"
			class={clsx('rounded p-2 text-base uppercase transition-colors', {
				'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length <= 1,
				'bg-black text-white dark:bg-emerald-500 dark:text-black': selected.length > 1
			})}
			on:click={guess}
			disabled={selected.length <= 1}>Guess</button
		>
	</div>
</div>
