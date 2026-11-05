<script lang="ts">
	import { ArrowLeft, RotateCcw, Trash } from '@lucide/svelte';
	import clsx from 'clsx';
	import { fly } from 'svelte/transition';

	export let clearUsedLetters: () => void;
	export let clearSelection: () => void;
	export let selected: string[];
	export let removeLetterFromSelection: () => void;
	export let guess: () => void;
	export let shouldAllowReplenish = false;

	let showKey = false;

	$: showKeyReactive = showKey;

	/**
	 * @description handles showing the key modal
	 */
	function handleShowKey() {
		showKey = !showKey;
	}

	/**
	 * @description handles replenishing the keyboard, if letters are not available
	 */
	function handleReplenishKeyboard() {
		if (shouldAllowReplenish) {
			clearUsedLetters();
		}
	}

	/**
	 * @description handles clearing user selection in UI
	 */
	function handleClearSelection() {
		if (selected.length > 0) {
			clearSelection();
		}
	}

	/**
	 * @description handles submitting a guess to the game
	 */
	function handleGuess() {
		if (selected.length > 2) {
			guess();
		}
	}
</script>

<div
	data-testid="button-rows"
	class="game-actions mt-3 flex w-full items-center justify-between gap-4"
>
	<div class="flex items-center gap-2">
		<div class="relative flex items-center">
			<button
				data-testid="replenish-keyboard"
				onclick={handleReplenishKeyboard}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': !shouldAllowReplenish,
					' bg-amber-500 text-black': shouldAllowReplenish
				})}><RotateCcw size={20} /></button
			>
		</div>
		<div>
			<button
				data-testid="clear-selection"
				onclick={handleClearSelection}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length === 0,
					'bg-discard text-background': selected.length > 0
				})}><Trash size={20} /></button
			>
		</div>
		<div>
			<button
				data-testid="delete-letter"
				onclick={removeLetterFromSelection}
				class={clsx('rounded p-2 transition-colors md:text-lg', {
					'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length === 0,
					'bg-selection text-background': selected.length > 0
				})}><ArrowLeft size={20} /></button
			>
		</div>
	</div>
	<div class="flex gap-2">
		<button
			data-testid="key-button"
			onclick={handleShowKey}
			class="relative flex items-center justify-center rounded bg-black p-2 text-sm text-white uppercase transition-colors md:text-base dark:bg-indigo-500 dark:text-black"
		>
			{#if showKeyReactive}
				<div data-testid="key-modal" class="keyboard-info" transition:fly>
					<div class="keyboard-info-heading">
						<p>Keyboard info</p>
					</div>
					<div class="flex w-full items-center gap-4">
						<div class="keyboard-info-key">
							<p>C</p>
							<div class="flex items-center gap-1">
								<span class="keyboard-info-marker block h-1 w-5"></span>
							</div>
						</div>
						<p class="text-left lowercase">A Line indicates infinite uses</p>
					</div>
					<div class="flex w-full items-center gap-4">
						<div class="keyboard-info-key">
							<p>I</p>
							<div class="flex items-center gap-1">
								<span class="keyboard-info-marker dot block h-1 w-1"></span>
								<span class="keyboard-info-marker dot block h-1 w-1"></span>
								<span class="keyboard-info-marker dot block h-1 w-1"></span>
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
			class={clsx('rounded p-2 text-sm uppercase transition-colors md:text-base', {
				'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60': selected.length <= 2,
				'bg-black text-white dark:bg-emerald-500 dark:text-black': selected.length > 2
			})}
			onclick={handleGuess}
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
