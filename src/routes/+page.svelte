<script lang="ts">
	import clsx from 'clsx';
	import { format, parseISO } from 'date-fns';
	import { fade, fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	export let data: CipherPuzzle;
	export let word = data.word;
	export let cipher = data.cipherWord;
	export let cipherState = cipher.split('');
	export let errors: string[] = [];
	export let win = false;
	export let lose = false;
	export let gameOver = false;
	export let moveLimit = data.maxAttempts;
	export let moveAmount = 0;
	export let modalOpen = false;

	const alpha = 'abcdefghijklmnopqrstuvwxyz'.split('');

	const today = format(parseISO(data.date), 'EEE d, yyyy');
	const date = new Date();
	const formattedDate = date.toISOString().split('T')[0];

	let selected: string[] = [];
	let guesses: string[] = [];

	function onSelect(letter: string) {
		if (gameOver) return;

		selected = [...selected, letter];
	}
	function removeLetterFromSelection() {
		selected.pop();
		selected = [...selected];
	}
	function clearSelection() {
		selected = [];
	}
	async function isValidWord(word: string) {
		const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

		return res.ok;
	}
	async function guess() {
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

		const isValidGuess = await isValidWord(selected.join(''));

		if (!isValidGuess) {
			errors = [...errors, 'Not a valid guess'];
			console.error('Not a valid word in list');
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

		if (moveIndex === startIndex) {
			errors = [...errors, 'Same position'];
			console.error('Move equates to same position');
			selected = [];
			return;
		}

		(function () {
			const newState = [...cipherState];
			[newState[startIndex], newState[moveIndex]] = [newState[moveIndex], newState[startIndex]];
			cipherState = [...newState];
		})();

		guesses = [...guesses, selected.join('')];
		selected = [];
		moveAmount++;
	}

	async function shareResults() {
		const shareText = win
			? `I cracked the Cipher in ${moveAmount}/${moveLimit}`
			: `I couldn't figure out the cipher today 😩`;

		navigator.share({
			text: shareText,
			title: 'Cipher Game',
			url: 'https://cipher-game-alpha.vercel.app/'
		});
	}

	$: (() => {
		if (typeof window === 'undefined') return;

		if (formattedDate !== data.date) {
			localStorage.removeItem('gameStatus');
			localStorage.removeItem('moves');
			localStorage.removeItem('cipher');
		}
		if (cipherState.join('') === word && moveAmount <= moveLimit) {
			win = true;
			gameOver = true;
			modalOpen = true;
			localStorage.setItem('gameStatus', 'win');
			localStorage.setItem('moves', String(moveAmount));
			localStorage.setItem('cipher', word);
		}
		if (moveAmount >= moveLimit) {
			lose = true;
			gameOver = true;
			modalOpen = true;
			localStorage.setItem('gameStatus', 'lose');
		}
		if (localStorage.getItem('gameStatus') === 'win') {
			win = true;
			gameOver = true;
			modalOpen = true;
		}
		if (localStorage.getItem('gameStatus') === 'lose') {
			lose = true;
			gameOver = true;
			modalOpen = true;
			moveAmount = moveLimit;
		}
		const moves = localStorage.getItem('moves');
		if (moves) {
			moveAmount = parseInt(moves);
		}
		if (errors.length > 0) {
			setTimeout(() => {
				const newErrors = [...errors];
				newErrors.pop();
				errors = newErrors;
			}, 3000);
		}
		const storedCipher = localStorage.getItem('cipher');
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}
	})();
</script>

<main class="flex w-screen flex-col items-center">
	<nav class="grid w-full grid-cols-3 justify-between border-b border-b-black">
		<div class="flex items-center justify-start px-4 text-sm text-black/50">
			<p>{today}</p>
		</div>
		<div class="flex items-center justify-center">
			<h2 class="text-3xl font-bold uppercase">CIPHER</h2>
		</div>
		<div class="flex items-center justify-end">
			<button
				on:click={() => {
					modalOpen = true;
				}}
				class="bg-black px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-black/80"
				>{gameOver ? 'share' : 'menu'}</button
			>
		</div>
	</nav>

	<div class="flex w-full items-center justify-between px-4 py-2 text-sm">
		<div>
			<p>Current: {moveAmount}</p>
		</div>
		<div>
			<p>Max Moves: {moveLimit}</p>
		</div>
	</div>

	{#if gameOver && modalOpen}
		<div
			transition:fade={{ delay: 1000 }}
			class="fixed top-0 left-0 z-10 flex h-screen w-screen flex-col items-center bg-white"
		>
			<div class="mt-2 flex w-full items-center justify-end px-4">
				<button
					class="text-lg font-bold text-black"
					on:click={() => {
						modalOpen = false;
					}}>X</button
				>
			</div>
			<div class="flex h-full w-full flex-col items-center justify-center">
				{#if win}
					<div class="flex w-full flex-col items-center justify-center gap-4">
						<h1 class="text-6xl font-bold text-emerald-500 uppercase">you won!</h1>
						<button class="rounded-full bg-black px-4 py-2 text-white" on:click={shareResults}
							>Share your result</button
						>
					</div>
				{/if}
				{#if lose}
					<div class="flex w-full flex-col items-center justify-center gap-4">
						<h1 class="text-6xl font-bold uppercase">better luck next time 😩!</h1>
						<button class="rounded-full bg-black px-4 py-2 text-white" on:click={shareResults}
							>Share your result</button
						>
					</div>
				{/if}
			</div>
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
				class="mt-2 flex w-full items-center justify-between gap-4 md:justify-end"
			>
				<div class="flex items-center gap-4">
					<div>
						<button
							on:click={clearSelection}
							class={clsx('rounded-full px-4 py-2 text-sm transition-colors md:text-lg', {
								'bg-gray-100 text-black/80': selected.length === 0,
								'bg-black text-white': selected.length > 0
							})}>Clear</button
						>
					</div>
					<div>
						<button
							on:click={removeLetterFromSelection}
							class={clsx('rounded-full px-4 py-2 text-sm transition-colors md:text-lg', {
								'bg-gray-100 text-black/80': selected.length === 0,
								'bg-black text-white': selected.length > 0
							})}>Delete</button
						>
					</div>
				</div>
				<div>
					<button
						class={clsx('rounded-full px-4 py-2 text-sm transition-colors md:text-lg', {
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
	<footer class="mt-8 flex w-full flex-col items-center bg-gray-100">
		<div class="flex w-full items-center border-b border-b-gray-200 px-4 py-2">
			<p class="text-xs text-gray-400">
				&copy; {new Date().getFullYear()} Alex Rothenberg. All rights reserved.
			</p>
		</div>
		<div class="flex w-full items-center justify-between border-b border-b-gray-200 px-4 py-2">
			<div>
				<p class="text-xs text-gray-400">
					created by <a
						href="https://alexshiresroth.com/"
						class="underline"
						target="_blank"
						rel="noopener noreferrer">Alex Rothenberg</a
					>
				</p>
			</div>
			<div>
				<p class="text-xs text-gray-400">v0.2@alpha</p>
			</div>
		</div>
		<div class="flex w-full items-center justify-center px-4 py-2">
			<p class="text-xs text-gray-400">
				Unauthorized copying, reproduction, or distribution of this game is prohibited.
			</p>
		</div>
	</footer>
</main>
