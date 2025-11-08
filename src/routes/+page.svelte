<script lang="ts">
	import clsx from 'clsx';
	import { fade, fly } from 'svelte/transition';

	export let word = 'squid';
	export let cipher = 'disqu';
	export let cipherState = cipher.split('');
	export let errors: string[] = [];
	export let win = false;
	export let lose = false;
	export let gameOver = false;
	// this is the amount you can move before losing
	export let moveLimit = 20;
	export let moveAmount = 0;

	const alpha = 'abcdefghijklmnopqrstuvwxyz'.split('');

	let selected: string[] = [];
	let guesses: string[] = [];

	function onSelect(letter: string) {
		selected = [...selected, letter];
		console.log('hello', letter);
	}
	function removeLetterFromSelection() {
		selected.pop();
		selected = [...selected];
	}
	function clearSelection() {
		selected = [];
	}
	function guess() {
		if (guesses.filter((guess) => guess === selected.join('')).length > 0) {
			errors = [...errors, 'Already guessed'];
			console.error('Already guessed!');
			selected = [];
			return;
		}
		if (selected.length === 1) {
			errors = [...errors, 'Too short'];
			console.error('Too short!');
			selected = [];
			return;
		}
		if (!cipherState.includes(selected[0])) {
			errors = [...errors, 'Not in cipher'];
			console.error('Not in cipher!');
			selected = [];
			return;
		}

		let selectionLength = selected.length;

		const startIndex = cipherState.indexOf(selected[0]);

		let moveIndex: number = startIndex + selectionLength;

		(function getMoveAmount() {
			if (moveIndex >= cipherState.length) {
				moveIndex = moveIndex - cipherState.length;
				return getMoveAmount();
			}
		})();

		(function () {
			const newState = [...cipherState];
			[newState[startIndex], newState[moveIndex]] = [newState[moveIndex], newState[startIndex]];
			cipherState = [...newState];
		})();

		guesses = [...guesses, selected.join('')];
		selected = [];
		moveAmount++;
	}

	$: (() => {
		if (cipherState.join('') === word) {
			win = true;
			gameOver = true;
		}
		if (moveAmount >= moveLimit) {
			lose = true;
			gameOver = true;
		}
		if (errors.length > 0) {
			setTimeout(() => {
				const newErrors = [...errors];
				newErrors.pop();
				errors = newErrors;
			}, 3000);
		}
	})();
</script>

<main class="flex w-screen flex-col items-center">
	<nav class="flex w-full justify-between border-b border-b-black">
		<div class="flex items-center px-4 text-black/50">
			<p>v0.1.alpha</p>
		</div>
		<div class="flex items-center justify-center">
			<h2 class="text-3xl font-bold uppercase">CIPHER</h2>
		</div>
		<div class="flex items-center">
			<button
				class="bg-black px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-black/80"
				>menu</button
			>
		</div>
	</nav>

	{#if gameOver}
		<div
			transition:fade={{ delay: 1000 }}
			class="fixed top-0 left-0 z-10 flex h-screen w-screen flex-col items-center justify-center bg-white"
		>
			{#if win}
				<h1 class="text-6xl font-bold text-emerald-500 uppercase">you won!</h1>
				<button>Share success</button>
			{/if}
			{#if lose}
				<h1 class="text-6xl font-bold uppercase">better luck next time 😩!</h1>
				<button>Share success</button>
			{/if}
		</div>
	{/if}

	<div class="absolute top-10 flex flex-col gap-2">
		{#each errors as error, i (`${error}-${i}`)}
			<button transition:fly={{ y: -100 }} class="bg-black p-2 text-sm text-white shadow-lg"
				>{error}</button
			>
		{/each}
	</div>

	<div class="flex w-11/12 flex-col items-center md:w-1/2 lg:w-1/3">
		<!-- Current user selection row -->
		<div class="my-4 flex w-full justify-center">
			{#if selected.length === 0}
				<p class="text-3xl opacity-0">{`p`}</p>
			{/if}
			{#each selected as s}
				<p class="text-3xl font-bold uppercase">{s}</p>
			{/each}
		</div>

		<!-- Cipher blocks row -->
		<div class="mb-8 flex w-full justify-center gap-2">
			{#each cipherState as key, i (`${key}-${i}`)}
				<div
					transition:fly={{ y: 100 }}
					class={clsx('flex w-12 items-center justify-center border-2 p-2 md:w-20', {
						'border-emerald-500 text-emerald-500': word.split('').indexOf(key) === i,
						'border-black': word.split('').indexOf(key) !== i
					})}
				>
					<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
				</div>
			{/each}
		</div>

		<!-- Letter selection box -->
		<div class="flex w-full justify-center">
			<div class="grid grid-cols-6 gap-4 md:grid-cols-7 md:gap-12">
				{#each alpha as l}
					<button
						on:click={() => onSelect(l)}
						class={clsx(
							'flex w-12 items-center justify-center rounded-full p-2 text-2xl uppercase hover:cursor-pointer md:text-4xl',
							{
								'bg-amber-300': selected.includes(l)
							}
						)}>{l}</button
					>
				{/each}
			</div>
		</div>

		<!-- Action buttons -->
		{#if !gameOver}
			<div
				data-testid="button-rows"
				class="mt-12 flex w-full items-center justify-between gap-4 md:justify-end"
			>
				<div>
					<button
						on:click={clearSelection}
						class={clsx('px-4 py-2 transition-colors md:text-lg', {
							'bg-gray-100 text-black/80': selected.length === 0,
							'bg-black text-white': selected.length > 0
						})}>Clear</button
					>
				</div>
				<div>
					<button
						on:click={removeLetterFromSelection}
						class={clsx('px-4 py-2 transition-colors md:text-lg', {
							'bg-gray-100 text-black/80': selected.length === 0,
							'bg-black text-white': selected.length > 0
						})}>Delete</button
					>
				</div>
				<div>
					<button
						class={clsx('px-4 py-2 transition-colors md:text-lg', {
							'bg-gray-100 text-black/80': selected.length <= 1,
							'bg-black text-white': selected.length > 1
						})}
						on:click={guess}
						disabled={selected.length <= 1}>Guess</button
					>
				</div>
			</div>
		{/if}
	</div>
</main>
