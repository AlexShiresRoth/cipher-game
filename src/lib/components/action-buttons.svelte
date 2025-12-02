<script lang="ts">
	import { ArrowLeft, RotateCcw, Trash } from '@lucide/svelte';
	import clsx from 'clsx';
	import UpdatePopup from './update-popup.svelte';

	export let clearUsedLetters: () => void;
	export let usedLetters: string[];
	export let showUpdatePopup: boolean;
	export let toggleUpdatePopup;
	export let clearSelection;
	export let selected: string[];
	export let removeLetterFromSelection: () => void;
	export let guess;
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
				<UpdatePopup toggleUpdatePopup={() => toggleUpdatePopup(showUpdatePopup)} alignClasses="">
					<p class="text-xs">
						<strong class="text-amber-500">UPDATE</strong>:{` `} New Replenish button—use this to regain
						unavailable letters. Using it costs a move.
					</p>
				</UpdatePopup>
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
				'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length <= 2,
				'bg-black text-white dark:bg-emerald-500 dark:text-black': selected.length > 2
			})}
			on:click={() => {
				if (selected.length > 2) {
					guess();
				}
			}}
			disabled={selected.length <= 2}>Guess</button
		>
	</div>
</div>
