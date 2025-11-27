<script lang="ts">
	import HowTo from '$lib/components/how-to.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { ArrowLeft, RotateCcw, Trash } from '@lucide/svelte';
	import clsx from 'clsx';
	import { format } from 'date-fns';
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { crossfade, fade, fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	export let data: CipherPuzzle & { id: string };
	export let word = data.word;
	export let cipher = data.cipherWord;
	export let cipherState = cipher.split('');
	export let errors: string[] = [];
	export let win = false;
	export let lose = false;
	export let gameOver = false;
	export let moveAmount = 0;
	export let modalOpen = false;
	export let showNavModal = false;

	const tiers: Record<number, { mistakes: number; emoji: string }> = {
		0: {
			mistakes: 0,
			emoji: '💎'
		},
		1: {
			mistakes: 1,
			emoji: '🥇'
		},
		2: {
			mistakes: 2,
			emoji: '🥈'
		},
		3: {
			mistakes: 3,
			emoji: '🥉'
		}
	};

	const alpha = 'qwertyuiopasdfghjklzxcvbnm'.split('');
	const date = new Date();

	let formattedDate = format(date.toLocaleDateString(), 'yyyy-MM-dd');

	$: formattedDate = format(new Date().toLocaleDateString(), 'yyyy-MM-dd');

	let selected: string[] = [];
	let guesses: string[] = [];
	let usedLetters: string[] = [];
	let swaps: boolean[] = [];
	let indexToSwap: number;
	let startIndex: number = -1;
	let allowChooseIndex = false;
	let showLetters = false;
	let loading = true;
	let showTutorial = false;
	let showUpdatePopup = false;
	let replenishAmt = 0;
	let correctPositions = cipherState.filter((l, i) => l === word[i]).length;

	function toggleModalOpen(val: boolean) {
		modalOpen = val;
	}

	function toggleUpdatePopup() {
		showUpdatePopup = !showUpdatePopup;
	}

	export const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: (params.duration as number) || 600,
				delay: params.delay,
				easing: quintOut,
				css: (t) => `
				transform: ${transform} scale(${t}) rotateY(${t});
				opacity: ${t}
			`
			};
		}
	});

	$: getTierByMoves = () => {
		return tiers[swaps.filter((b) => !b).length + replenishAmt] || tiers[3];
	};

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
		allowChooseIndex = false;
	}

	function clearUsedLetters() {
		usedLetters = [];
		moveAmount++;
		replenishAmt++;
		localStorage.removeItem('usedLetters');
		localStorage.setItem('moves', JSON.stringify(moveAmount));
		localStorage.setItem('replenishAmt', JSON.stringify(replenishAmt));
	}

	// remove all stored data
	function resetStorage() {
		win = false;
		lose = false;
		gameOver = false;
		modalOpen = false;
		clearSelection();
		guesses = [];
		moveAmount = 0;
		cipherState = data.cipherWord.split('');
		usedLetters = [];
		replenishAmt = 0;
		swaps = [];
		localStorage.clear();
	}

	// handle if user has already completed todays game
	function checkTodaysPuzzle() {
		const savedGuesses = localStorage.getItem('guesses');
		const moves = localStorage.getItem('moves');
		const puzzle = localStorage.getItem('puzzle');
		if (savedGuesses && moves) {
			guesses = JSON.parse(savedGuesses);
			moveAmount = parseInt(moves);
		}
		if (puzzle !== data.word) {
			resetStorage();
			return;
		}
		if (localStorage.getItem('gameStatus') === 'win') {
			win = true;
			gameOver = true;
			modalOpen = true;
		}
	}

	function addTodaysPuzzleToStorage() {
		localStorage.setItem('puzzle', word);
	}

	function shouldShowTutorial() {
		const hasViewedGame = localStorage.getItem('viewed');
		if (hasViewedGame) {
			return;
		} else {
			showTutorial = true;
			showUpdatePopup = true;
			localStorage.setItem('viewed', 'true');
		}
	}

	// check for when user has either won or lost game
	function checkForGameStatus() {
		const moves = localStorage.getItem('moves');
		const storedCipher = localStorage.getItem('cipher');
		const lettersUsed = localStorage.getItem('usedLetters');
		const correctGuesses = localStorage.getItem('swaps');
		const replenishAmount = localStorage.getItem('replenishAmt');
		if (!gameOver && cipherState.join('') === word) {
			win = true;
			gameOver = true;
			modalOpen = true;
			localStorage.setItem('gameStatus', 'win');
			localStorage.setItem('moves', String(moveAmount));
			localStorage.setItem('cipher', word);
			localStorage.setItem('date', formattedDate);
			return;
		}
		if (moves) {
			moveAmount = parseInt(moves);
		}
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}
		if (lettersUsed) {
			usedLetters = JSON.parse(lettersUsed);
		}
		if (replenishAmount) {
			replenishAmt = JSON.parse(replenishAmount);
		}
		if (correctGuesses) {
			swaps = JSON.parse(correctGuesses);
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
		try {
			const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

			return res.ok;
		} catch (error) {
			console.error(error);
			errors = [
				...errors,
				`The dictionary service we rely on is temporarily down due to a global outage.
        Your game data is safe — this should be resolved soon!`
			];
			clearSelection();
		}
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

		const isCorrectGuess =
			cipherState.filter((l, i) => l === word[i]).length > correctPositions ? true : false;

		swaps = [...swaps, isCorrectGuess];
		correctPositions = cipherState.filter((l, i) => l === word[i]).length;
		guesses = [...guesses, selected.join('')];
		usedLetters = [...usedLetters, ...selected];
		clearSelection();
		moveAmount++;
		// save current play if window refresh
		localStorage.setItem('guesses', JSON.stringify(guesses));
		localStorage.setItem('moves', JSON.stringify(moveAmount));
		localStorage.setItem('cipher', cipherState.join(''));
		localStorage.setItem('usedLetters', JSON.stringify(usedLetters));
		localStorage.setItem('swaps', JSON.stringify(swaps));
	}

	// social results game sharing
	async function shareResults() {
		function getRows() {
			let rows: boolean[][] = [];
			for (let i = 0; i < swaps.length; i += 4) {
				rows.push(swaps.slice(i, i + 4));
			}
			return rows;
		}

		const rows = getRows();
		const rowsText = rows
			.map((row) => {
				return row.map((b) => (b ? '🟩' : '🟥')).join('');
			})
			.join('\n');

		const shareText = `🔐 Cipher #${data.id} ${getTierByMoves()?.emoji}
⬆️ ${moveAmount} moves
${rowsText}
🔄 ${replenishAmt} reps used`.trim();
		console.log('safasf', shareText);
		navigator.share({
			text: shareText,
			title: `Cipher #${data.id}`,
			url: 'https://play-cipher.com'
		});
	}

	// check if duplicate letters should highlight
	$: handleSelectedLetter = (key: string) => {
		return allowChooseIndex && cipherState.filter(() => key === selected[0]).length > 1;
	};

	$: highlightAtStartIndex = (i: number) => {
		return startIndex === i;
	};

	$: highlightAtSwapIndex = (i: number) => {
		return indexToSwap === i;
	};

	$: highlightAtCorrectPosition = (i: number) => {
		return word.split('')[i] === cipherState[i];
	};

	$: defaultCipherDisplay = (i: number, key: string) => {
		return (
			startIndex !== i &&
			word.split('')[i] !== cipherState[i] &&
			indexToSwap !== i &&
			cipherState.filter(() => key === selected[0]).length === 1
		);
	};

	$: isAvailable = (l: string) => {
		if (!usedLetters.includes(l) || cipherState.includes(l)) return true;

		return false;
	};

	onMount(() => {
		checkTodaysPuzzle();
		addTodaysPuzzleToStorage();
		shouldShowTutorial();
		const interval = setInterval(checkTodaysPuzzle, 60 * 1000); // every minute
		return () => clearInterval(interval);
	});

	// reactive effects
	$: (() => {
		(startIndex, indexToSwap, selected, allowChooseIndex, guesses, win, lose, gameOver);
		(moveAmount, modalOpen, showNavModal, loading, usedLetters, showUpdatePopup, swaps, date);

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

<svelte:head>
	<title>CIPHER | Play</title>
	<meta
		name="description"
		content="Play Cipher, the daily interactive word-scramble puzzle game. Decode the shuffled word using clever moves, swapping mechanics, and logic-based strategy."
	/>
</svelte:head>

<Nav {gameOver} {showNavModal} {toggleModalOpen} />

{#if showTutorial && !loading}
	<div
		class="fixed top-0 z-20 flex max-h-full w-screen flex-col items-end gap-4 overflow-y-scroll bg-white/40 px-4 pt-10 dark:bg-black/40"
	>
		<button
			on:click={() => (showTutorial = false)}
			class="bg-white p-4 text-black dark:bg-black dark:text-white"
			transition:fly={{ y: -200 }}>close</button
		>
		<div class="bg-white dark:bg-black" transition:fly={{ y: 200 }}>
			<HowTo />
		</div>
	</div>
{/if}

{#if gameOver && modalOpen}
	<div
		transition:fade
		class="fixed top-0 left-0 z-10 flex h-screen w-screen flex-col items-center bg-white dark:bg-black"
	>
		<div class="mt-2 flex w-full items-center justify-end px-4">
			<button
				class="text-lg font-bold text-black dark:text-white"
				on:click={() => {
					modalOpen = false;
				}}>X</button
			>
		</div>

		<div class="flex h-full w-full flex-col items-center justify-center">
			{#if win}
				<div class="flex w-full flex-col items-center justify-center gap-4">
					{#if showLetters}
						<div class="flex w-full justify-center">
							<p class="text-7xl dark:text-white">{getTierByMoves()?.emoji}</p>
						</div>
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
							class="rounded-full bg-black px-4 py-2 text-white hover:cursor-pointer dark:bg-emerald-500 dark:text-black"
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
		<div class="flex w-full flex-col gap-2 py-2 text-sm">
			<div class="flex w-full items-center justify-between">
				<div><p class="dark:text-white/80">Status {getTierByMoves()?.emoji}</p></div>
				<div class="flex gap-2">
					<p class=" dark:text-white/80">Moves</p>
					<span class="relative inline-block w-[1ch]">
						{#key moveAmount}
							<span class="absolute top-0 left-0" transition:fly={{ y: -40 }}>
								{moveAmount}
							</span>
						{/key}
					</span>
				</div>
			</div>
			<div class="flex gap-2">
				<p class="dark:text-white/80">Reps</p>
				<span class="relative inline-block w-[1ch]">
					{#key replenishAmt}
						<span class="absolute top-0 left-0" transition:fly={{ y: -40 }}>
							{replenishAmt}
						</span>
					{/key}
				</span>
			</div>
		</div>
		<!-- Current user selection row -->
		<div class="my-4 flex w-full justify-center">
			{#if selected.length === 0}
				<p class="text-3xl opacity-0">{`p`}</p>
			{/if}
			{#each selected as s}
				<p class="text-3xl font-bold uppercase dark:text-white">{s}</p>
			{/each}
		</div>

		<!-- Cipher blocks row -->
		<div class="mb-8 flex w-full max-w-full justify-center gap-2">
			{#each cipherState as key, i (`${key}-${i}`)}
				<button
					on:click={() => {
						if (allowChooseIndex) {
							chooseStartingIndex(i);
						}
					}}
					in:receive={{ key: `${key}-${i}`, delay: i * 100, duration: i * 100 }}
					out:send={{ key: `${key}-${i}`, delay: 0, duration: i * 100 }}
					animate:flip
					class={clsx(
						'relative flex items-center justify-center border-2 p-2 transition-all md:min-w-16',
						{
							'border-emerald-500 text-emerald-500':
								highlightAtCorrectPosition(i) && !handleSelectedLetter(key),
							'border-black dark:border-white dark:text-white': defaultCipherDisplay(i, key),
							'animate-bounce border-amber-500 text-amber-500 hover:cursor-pointer':
								handleSelectedLetter(key),
							'border-amber-500 text-amber-500': highlightAtStartIndex(i),
							'border-indigo-500 text-indigo-500':
								highlightAtSwapIndex(i) && !handleSelectedLetter(key),
							'min-w-10': cipherState.length <= 7,
							'min-w-8': cipherState.length > 7
						}
					)}
				>
					<p class="text-2xl font-bold uppercase md:text-5xl">{key}</p>
					{#if handleSelectedLetter(key)}
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
			<div class="flex flex-wrap items-center justify-center gap-2 md:gap-4 dark:text-black">
				{#each alpha as l}
					{#if isAvailable(l)}
						<button
							on:click={() => onSelect(l)}
							class={clsx(
								'flex w-12 items-center justify-center rounded p-1 text-2xl uppercase transition-colors hover:cursor-pointer md:text-4xl',
								{
									'bg-amber-300': selected.includes(l),
									'bg-gray-100 dark:bg-gray-100/80': !selected.includes(l)
								}
							)}>{l}</button
						>
					{:else}
						<button
							disabled
							class={clsx(
								'flex w-12 items-center justify-center rounded p-1 text-2xl  uppercase transition-colors hover:cursor-pointer md:text-4xl',
								{
									'text-gray-400/50 dark:bg-gray-100/10': !selected.includes(l),
									'bg-amber-300 text-black': selected.includes(l)
								}
							)}>{l}</button
						>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Action buttons -->
		{#if !gameOver}
			<div data-testid="button-rows" class="my-8 flex w-full items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<div class="relative flex items-center">
						<button
							on:click={clearUsedLetters}
							class={clsx('rounded p-2 transition-colors md:text-lg', {
								'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60':
									usedLetters.length === 0,
								' bg-amber-500 text-white': usedLetters.length > 0
							})}><RotateCcw size={23} /></button
						>
						{#if showUpdatePopup}
							<button
								transition:fade
								class="absolute bottom-full w-[250px] rounded border border-black/10 bg-white p-4 shadow-md after:absolute
							after:top-full after:left-4 after:-translate-x-1/2 after:border-8
							after:border-transparent after:border-t-white
							hover:cursor-pointer dark:border-gray-100/50 dark:bg-black after:dark:border-t-black"
								on:click={toggleUpdatePopup}
							>
								<p
									class="absolute -top-3 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-100/50 bg-white text-xs dark:bg-black"
								>
									X
								</p>
								<p class="text-xs">
									<strong class="text-amber-500">UPDATE</strong>:{` `} New Replenish button—use this
									to regain unavailable letters. Using it costs a move.
								</p>
							</button>
						{/if}
					</div>
					<div>
						<button
							on:click={clearSelection}
							class={clsx('rounded p-2 transition-colors md:text-lg', {
								'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60':
									selected.length === 0,
								'bg-black text-white dark:bg-indigo-500': selected.length > 0
							})}><Trash size={23} /></button
						>
					</div>
					<div>
						<button
							on:click={removeLetterFromSelection}
							class={clsx('rounded p-2 transition-colors md:text-lg', {
								'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60':
									selected.length === 0,
								'bg-black text-white dark:bg-indigo-500': selected.length > 0
							})}><ArrowLeft size={23} /></button
						>
					</div>
				</div>
				<div>
					<button
						class={clsx('rounded p-2 text-base uppercase transition-colors', {
							'bg-gray-100 text-black/80 dark:bg-gray-100/50 dark:text-black/60':
								selected.length <= 1,
							'bg-black text-white dark:bg-emerald-500 dark:text-black': selected.length > 1
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
			<img src="/logo.svg" alt="logo" height="300" width="300" />
		</div>
	{/if}
</div>
