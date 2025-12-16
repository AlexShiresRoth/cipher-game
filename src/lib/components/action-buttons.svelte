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
			data-testid="key-button"
			on:click={() => (showKey = !showKey)}
			class="relative flex items-center justify-center rounded bg-black p-2 text-base text-white uppercase transition-colors dark:bg-indigo-500 dark:text-black"
		>
			{#if showKey}
				<div
					data-testid="key-modal"
					class="absolute bottom-full flex w-54 flex-col items-center gap-2 border-2 border-black bg-white p-4 text-sm text-black shadow-lg after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
							after:border-8 after:border-transparent after:border-t-white hover:cursor-pointer
							dark:border-white dark:bg-black dark:text-white after:dark:border-t-black"
					transition:fly
				>
					<div class="mb-2 w-full border-b-2 border-b-black py-2 dark:border-gray-100">
						<p>Keyboard info</p>
					</div>
					<div class="flex w-full items-center gap-4">
						<div
							class="flex min-w-10 flex-col items-center gap-1 rounded bg-gray-100 p-2 text-2xl text-black dark:bg-gray-100/80"
						>
							<p>C</p>
							<div class="flex items-center gap-1">
								<span class="block h-1 w-5 bg-black"></span>
							</div>
						</div>
						<p class="text-left lowercase">A Line indicates infinite uses</p>
					</div>
					<div class="flex w-full items-center gap-4">
						<div
							class="flex min-w-10 flex-col items-center gap-1 rounded bg-gray-100 p-2 text-2xl text-black dark:bg-gray-100/80"
						>
							<p>I</p>
							<div class="flex items-center gap-1">
								<span class="dot block h-1 w-1 bg-black"></span>
								<span class="dot block h-1 w-1 bg-black"></span>
								<span class="dot block h-1 w-1 bg-black"></span>
							</div>
						</div>
						<p class="text-left lowercase">Dots represent uses left</p>
					</div>
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

<style>
	.dot {
		animation: fade 6s infinite;
	}

	.dot:nth-child(1) {
		animation-delay: 3s;
	}
	.dot:nth-child(2) {
		animation-delay: 2s;
	}
	.dot:nth-child(3) {
		animation-delay: 1s;
	}

	@keyframes fade {
		0%,
		80%,
		100% {
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
	}
</style>
