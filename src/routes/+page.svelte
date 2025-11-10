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
	export let showNavModal = false;

	const alpha = 'qwertyuiopasdfghjklzxcvbnm'.split('');

	const today = format(parseISO(data.date), 'EEE d, yyyy');
	const date = new Date();
	const formattedDate = date.toISOString().split('T')[0];

	let selected: string[] = [];
	let guesses: string[] = [];

	let indexToSwap: number;

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
		indexToSwap = -1;
	}
	function getMoveToIndex() {
		let selectionLength = selected.length;

		const startIndex = cipherState.indexOf(selected[0]);

		let moveIndex: number = startIndex + selectionLength;

		(function getMoveAmount() {
			if (moveIndex >= cipherState.length) {
				moveIndex = moveIndex - cipherState.length;
				return getMoveAmount();
			}
		})();

		return { moveIndex, startIndex };
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
			indexToSwap = -1;
			return;
		}
		if (selected.length === 1) {
			errors = [...errors, 'Too short'];
			console.error('Too short!');
			selected = [];
			indexToSwap = -1;
			return;
		}
		if (!cipherState.includes(selected[0])) {
			errors = [...errors, 'Not in cipher'];
			console.error('Not in cipher!');
			selected = [];
			indexToSwap = -1;
			return;
		}

		const isValidGuess = await isValidWord(selected.join(''));

		if (!isValidGuess) {
			errors = [...errors, 'Not a valid guess'];
			console.error('Not a valid word in list');
			selected = [];
			indexToSwap = -1;
			return;
		}

		const { moveIndex, startIndex } = getMoveToIndex();

		if (moveIndex === startIndex) {
			errors = [...errors, 'Same position'];
			console.error('Move equates to same position');
			selected = [];
			indexToSwap = -1;
			return;
		}

		(function () {
			const newState = [...cipherState];
			[newState[startIndex], newState[moveIndex]] = [newState[moveIndex], newState[startIndex]];
			cipherState = [...newState];
		})();

		guesses = [...guesses, selected.join('')];
		selected = [];
		indexToSwap = -1;
		moveAmount++;
	}

	async function shareResults() {
		const shareText = win
			? `I cracked the Cipher in ${moveAmount}/${moveLimit} moves 😉`
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
		if (moveAmount > moveLimit) {
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
		if (selected.length > 1) {
			const { moveIndex } = getMoveToIndex();
			indexToSwap = moveIndex;
		}
	})();
</script>

<main class="mb-28 flex w-screen flex-col items-center">
	<nav class="grid w-full grid-cols-3 justify-between border-b border-b-black">
		<div class="flex items-center justify-start px-4 text-sm text-black/50">
			<p>{today}</p>
		</div>
		<div class="flex items-center justify-center">
			<h2 class="text-3xl font-bold uppercase">CIPHER</h2>
		</div>
		<div
			class="relative flex items-center justify-end"
			on:mouseleave={() => {
				showNavModal = false;
			}}
			role="button"
			tabindex="0"
		>
			<button
				on:click={() => {
					showNavModal = true;
				}}
				class="bg-black px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-black/80"
				>{'menu'}</button
			>
			{#if showNavModal}
				<div
					class="absolute top-full left-0 z-10 flex w-full flex-col items-start bg-black p-2 text-white"
				>
					<a href="/how-to">how to play</a>
					{#if gameOver}
						<button
							on:click={() => {
								modalOpen = true;
							}}>share</button
						>
					{/if}
				</div>
			{/if}
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
					transition:fly={{ y: 100, duration: 700, delay: 100 * (i + 1) }}
					class={clsx(
						'relative flex w-12 items-center justify-center border-2 p-2 transition-all md:w-20',
						{
							'border-amber-500 text-amber-500': cipherState[i] === selected[0],
							'border-indigo-500 text-indigo-500 shadow-[3px_3px_0px_1px_rgba(0,0,0,.2)]':
								indexToSwap === i,
							'border-emerald-500 text-emerald-500': word.split('').indexOf(key) === i,
							'border-black': word.split('').indexOf(key) !== i && cipherState[i] !== selected[0]
						}
					)}
				>
					<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
					{#if selected.length > 0 && cipherState[i] === selected[0]}
						<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
							<span class="text-xs text-amber-500 uppercase">{cipherState[indexToSwap]}</span>
						</div>
					{/if}
					{#if indexToSwap === i}
						<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
							<span class="text-xs text-indigo-500 uppercase">{selected[0]}</span>
						</div>
					{/if}
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
</main>
