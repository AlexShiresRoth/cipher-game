<script lang="ts">
	import clsx from 'clsx';
	import { format } from 'date-fns';
	import { onMount, tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	export let data: CipherPuzzle & { id: string };
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
	const today = format(new Date().toLocaleDateString(), 'EEE d, yyyy');
	const date = new Date();
	const formattedDate = format(date.toLocaleDateString(), 'yyyy-MM-dd');

	let selected: string[] = [];
	let guesses: string[] = [];
	let indexToSwap: number;
	let startIndex: number = -1;
	let allowChooseIndex = false;
	let showLetters = false;
	let loading = true;
	// user action for selecting letters
	function onSelect(letter: string) {
		if (gameOver) return;
		if (selected.length >= 12) return;
		selected = [...selected, letter];
		// set starting index to the first letter of selection
		if (selected.length <= 1) {
			startIndex = cipherState.indexOf(selected[0]);
		}
		// we need to allow selecting starting index if there are duplicate letters
		if (selected[0] === letter) {
			if (cipherState.filter((l) => l === letter).length > 1) {
				allowChooseIndex = true;
			}
		}
		if (selected.length > 1) {
			allowChooseIndex = false;
		}
	}

	// find index to swap with based on word guess
	function getMoveToIndex() {
		let selectionLength = selected.length;

		let moveIndex: number = startIndex + selectionLength;

		(function getMoveAmount() {
			if (moveIndex >= cipherState.length) {
				moveIndex = moveIndex - cipherState.length;
				return getMoveAmount();
			}
		})();

		return moveIndex;
	}

	// this only happens if there are duplicate letters
	// the user can then click on the letter
	function chooseStartingIndex(index: number) {
		if (cipherState[index] === selected[0]) {
			startIndex = index;
			allowChooseIndex = false;
			const moveIndex = getMoveToIndex();
			indexToSwap = moveIndex;
		}
	}

	// delete one letter from guess
	function removeLetterFromSelection() {
		selected.pop();
		selected = [...selected];
	}

	// clear word guess
	function clearSelection() {
		selected = [];
		indexToSwap = -1;
		startIndex = -1;
	}

	// remove all stored data
	function resetStorage() {
		win = false;
		lose = false;
		gameOver = false;
		modalOpen = false;
		clearSelection();
		localStorage.removeItem('date');
		localStorage.removeItem('gameStatus');
		localStorage.removeItem('cipher');
		localStorage.removeItem('moves');
	}

	// handle if user has already completed todays game
	function checkTodaysPuzzle() {
		const savedGame = localStorage.getItem('date');
		const savedGuesses = localStorage.getItem('guesses');
		const moves = localStorage.getItem('moves');

		if (formattedDate !== data.date) {
			resetStorage();
		}
		if (savedGame && formattedDate !== savedGame) {
			resetStorage();
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
		if (savedGuesses && moves) {
			guesses = JSON.parse(savedGuesses);
			moveAmount = parseInt(moves);
		}
	}

	// check for when user has either won or lost game
	function checkForGameStatus() {
		const moves = localStorage.getItem('moves');
		const storedCipher = localStorage.getItem('cipher');

		if (!gameOver && cipherState.join('') === word) {
			win = true;
			gameOver = true;
			modalOpen = true;
			localStorage.setItem('gameStatus', 'win');
			localStorage.setItem('moves', String(moveAmount));
			localStorage.setItem('cipher', word);
			localStorage.setItem('date', formattedDate);
		}

		if (moves) {
			moveAmount = parseInt(moves);
		}
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}
		loading = false;
	}

	// render any errors & remove after set time
	function checkForErrors() {
		if (errors.length > 0) {
			setTimeout(() => {
				const newErrors = [...errors];
				newErrors.pop();
				errors = newErrors;
			}, 3000);
		}
	}

	// handle user selection & interaction
	function checkSelection() {
		if (selected.length > 0) {
			const moveIndex = getMoveToIndex();
			indexToSwap = moveIndex;
		}
		if (selected.length === 0) {
			clearSelection();
		}
	}

	// word guess validation check
	async function isValidWord(word: string) {
		const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

		return res.ok;
	}

	// guess input event
	async function guess() {
		if (guesses.filter((guess) => guess === selected.join('')).length > 0) {
			errors = [...errors, 'Already guessed'];
			console.error('Already guessed!');
			clearSelection();
			return;
		}
		if (selected.length <= 2) {
			errors = [...errors, 'Too short'];
			console.error('Too short!');
			clearSelection();
			return;
		}
		if (!cipherState.includes(selected[0])) {
			errors = [...errors, 'Not in cipher'];
			console.error('Not in cipher!');
			clearSelection();
			return;
		}

		const isValidGuess = await isValidWord(selected.join(''));

		if (!isValidGuess) {
			errors = [...errors, 'Not a valid guess'];
			console.error('Not a valid word in list');
			clearSelection();
			return;
		}

		const moveIndex = getMoveToIndex();

		if (moveIndex === startIndex) {
			errors = [...errors, 'Same position'];
			console.error('Move equates to same position');
			clearSelection();
			return;
		}

		(function () {
			const newState = [...cipherState];
			[newState[startIndex], newState[moveIndex]] = [newState[moveIndex], newState[startIndex]];
			cipherState = [...newState];
		})();

		guesses = [...guesses, selected.join('')];
		clearSelection();
		moveAmount++;
		// save current play if window refresh
		localStorage.setItem('guesses', JSON.stringify(guesses));
		localStorage.setItem('moves', JSON.stringify(moveAmount));
		localStorage.setItem('cipher', cipherState.join(''));
	}

	// social results game sharing
	async function shareResults() {
		const shareText = win
			? `I cracked the Cipher in ${moveAmount} moves 😉`
			: `The Cipher stumped me today 😩`;

		navigator.share({
			text: shareText,
			title: `Cipher #${data.id}`,
			url: 'https://cipher-game-alpha.vercel.app/'
		});
	}

	onMount(() => {
		checkTodaysPuzzle();
	});

	// reactive effects
	$: (() => {
		(startIndex, indexToSwap, selected, allowChooseIndex, guesses, win, lose, gameOver);
		(moveAmount, modalOpen, showNavModal, loading);

		if (typeof window === 'undefined') return;

		checkForGameStatus();
		checkForErrors();
		checkSelection();

		showLetters = false;

		tick().then(() => {
			setTimeout(() => (showLetters = true), 200);
		});
	})();
</script>

<main class="mb-28 flex min-h-[80vh] w-screen flex-col items-center">
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
					showNavModal = !showNavModal;
				}}
				class="bg-black px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-black/80"
				>{'menu'}</button
			>
			{#if showNavModal}
				<div
					class="absolute top-full right-0 z-10 flex w-full max-w-36 flex-col items-start bg-black text-white"
				>
					<a href="/how-to" class="w-full px-2 py-1">how to play</a>
					{#if gameOver}
						<button
							class="w-full border-t border-t-white/40 px-2 py-1 text-left"
							on:click={() => {
								modalOpen = true;
							}}>share</button
						>
					{/if}
				</div>
			{/if}
		</div>
	</nav>

	{#if gameOver && modalOpen}
		<div
			transition:fade
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
						{#if showLetters}
							<h2 transition:fly={{ y: 100, delay: 10 }}>The Cipher Was:</h2>
						{/if}
						<div class="flex w-11/12 items-center justify-center gap-2">
							{#each word.split('') as letter, i (`${letter}-${i}`)}
								{#if showLetters}
									<div
										transition:fly={{ y: -100, delay: i * 80, duration: 400 }}
										class="w-12 border-2 border-emerald-500 p-2 text-center text-emerald-500 uppercase"
									>
										<p>{letter}</p>
									</div>
								{/if}
								{#if !showLetters}
									<div class="opacity-0"><p>{letter}</p></div>
								{/if}
							{/each}
						</div>
						{#if showLetters}
							<h1
								transition:fly={{ y: 100, delay: 200 }}
								class="text-center text-4xl font-bold uppercase"
							>
								congrats! you cracked it 🥹
							</h1>

							<button
								transition:fly={{ y: 100, delay: 300 }}
								class="rounded-full bg-black px-4 py-2 text-white"
								on:click={shareResults}>Share your result</button
							>
						{/if}
					</div>
				{/if}
				{#if lose}
					<div class="flex w-full flex-col items-center justify-center gap-4">
						{#if showLetters}
							<h2 transition:fly={{ y: 100, delay: 10 }}>The Cipher Was:</h2>
						{/if}
						<div class="flex w-11/12 justify-center gap-1">
							{#each word.split('') as letter, i (`${letter}-${i}`)}
								{#if showLetters}
									<div
										transition:fly={{ y: -100, delay: i * 80, duration: 400 }}
										class="w-12 border-2 border-black p-2 text-center uppercase"
									>
										<p>{letter}</p>
									</div>
								{/if}
								{#if !showLetters}
									<div class="opacity-0"><p>{letter}</p></div>
								{/if}
							{/each}
						</div>
						{#if showLetters}
							<h1
								transition:fly={{ y: 100, delay: 1000, duration: 400 }}
								class="text-center text-4xl font-bold uppercase"
							>
								better luck next time 😩!
							</h1>
							<button
								transition:fly={{ y: 100, delay: 1200, duration: 400 }}
								class="rounded-full bg-black px-4 py-2 text-white"
								on:click={shareResults}>Share your result</button
							>
						{/if}
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
		{#if !loading}
			<!-- Moves row -->
			<div class="flex w-full items-center justify-between py-2 text-sm">
				<div><p></p></div>
				<div>
					<p>Moves: {moveAmount}</p>
				</div>
			</div>
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
					<button
						on:click={() => {
							if (allowChooseIndex) {
								chooseStartingIndex(i);
							}
						}}
						transition:fly={{ y: 100, duration: 700, delay: 100 * (i + 1) }}
						class={clsx(
							'relative flex w-12 items-center justify-center border-2 p-2 transition-all md:w-20',
							{
								'animate-bounce border-amber-500 text-amber-500 hover:cursor-pointer':
									allowChooseIndex && cipherState.filter((l) => l === key).length > 1,
								'border-amber-500 text-amber-500': startIndex === i,
								'border-indigo-500 text-indigo-500 shadow-[3px_3px_0px_1px_rgba(0,0,0,.2)]':
									indexToSwap === i,
								'border-emerald-500 text-emerald-500': word.split('')[i] === cipherState[i],
								'border-black': startIndex !== i && !allowChooseIndex
							}
						)}
					>
						<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
						{#if allowChooseIndex && cipherState.filter((l) => l === key).length > 1}
							<div
								class="absolute -bottom-10 z-10 flex flex-col items-center justify-center"
								transition:fly={{ y: 20 }}
							>
								<span class="text-xs text-amber-500 uppercase">Press here</span>
							</div>
						{/if}
						{#if startIndex === i && !allowChooseIndex}
							<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
								<span class="text-xs text-amber-500 uppercase">{cipherState[indexToSwap]}</span>
							</div>
						{/if}
						{#if indexToSwap === i && !allowChooseIndex}
							<div class="absolute -bottom-6 z-10" transition:fly={{ y: 20 }}>
								<span class="text-xs text-indigo-500 uppercase">{selected[0]}</span>
							</div>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Letter selection box -->
			<div class="flex w-full justify-center">
				<div class="flex flex-wrap items-center justify-center gap-2 md:gap-4">
					{#each alpha as l}
						<button
							on:click={() => onSelect(l)}
							class={clsx(
								'flex w-12 items-center justify-center rounded p-1 text-2xl uppercase hover:cursor-pointer md:text-4xl',
								{
									'bg-amber-300': selected.includes(l),
									'bg-gray-100': !selected.includes(l)
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
					class="my-8 flex w-full items-center justify-between gap-4 md:justify-end"
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
		{/if}
		{#if loading}
			<div class="flex h-[80vh] items-center justify-center gap-2">
				{#each 'CIPHER'.split('') as key, i (`${key}-${i}`)}
					<div
						transition:fly={{ y: 100, duration: 700, delay: 100 * (i + 1) }}
						class="relative flex w-12 animate-bounce items-center justify-center border-2 border-black p-2 transition-all md:w-20"
					>
						<p class="font-bold">{key}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>
