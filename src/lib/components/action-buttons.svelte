<script lang="ts">
	import { ArrowLeft, RotateCcw, Trash } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';
	import UpdatePopup from './update-popup.svelte';

	export let clearUsedLetters: () => void;
	export let usedLetters: string[];
	export let showUpdatePopup: boolean;
	export let toggleUpdatePopup;
	export let clearSelection;
	export let selected: string[];
	export let removeLetterFromSelection: () => void;
	export let guess;

	$: showKey = false;
</script>

<div data-testid="button-rows" class="my-8 flex w-full items-center justify-between gap-4">
	<div class="flex items-center gap-2">
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
					' bg-amber-500 text-black': usedLetters.length > 0
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
					'bg-black text-white dark:bg-indigo-500 dark:text-black': selected.length > 0
				})}><Trash size={23} /></button
			>
		</div>
		<div>
			<button
				data-testid="delete-letter"
				on:click={removeLetterFromSelection}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length === 0,
					'bg-black text-white dark:bg-indigo-500 dark:text-black': selected.length > 0
				})}><ArrowLeft size={23} /></button
			>
		</div>
	</div>
	<div class="flex gap-2">
		<button
			on:click={() => (showKey = !showKey)}
			class="relative flex items-center justify-center rounded bg-black p-2 text-base text-white uppercase transition-colors dark:bg-indigo-500 dark:text-black"
		>
			{#if showKey}
				<div
					class="absolute bottom-full flex w-52 flex-col items-center gap-2 rounded border border-gray-200 bg-white p-4 text-sm text-black shadow-lg after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
							after:border-8 after:border-transparent after:border-t-white hover:cursor-pointer
							dark:bg-black dark:text-white after:dark:border-t-black"
					transition:fly
				>
					<p class="flex w-full items-center gap-4">
						<span class="block h-8 w-8 rounded bg-yellow-500"></span>{` `} 3 uses left
					</p>
					<p class="flex w-full items-center gap-4">
						<span class="block h-8 w-8 rounded bg-orange-500"></span>{` `} 2 uses left
					</p>
					<p class="flex w-full items-center gap-4">
						<span class="block h-8 w-8 rounded bg-red-500"></span>{` `} 1 uses left
					</p>
					<p class="flex w-full items-center gap-4">
						<span class="block h-8 w-8 rounded bg-gray-100"></span>{` `} unlimited uses
					</p>
				</div>
			{/if}
			Key
		</button>
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
