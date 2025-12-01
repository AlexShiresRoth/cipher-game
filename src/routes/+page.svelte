<script lang="ts">
	import ActionButtons from '$lib/components/action-buttons.svelte';
	import Cipher from '$lib/components/cipher.svelte';
	import GameOverModal from '$lib/components/game-over-modal.svelte';
	import HowTo from '$lib/components/how-to.svelte';
	import Keyboard from '$lib/components/keyboard.svelte';
	import Nav from '$lib/components/nav.svelte';
	import Selection from '$lib/components/selection.svelte';
	import Stats from '$lib/components/stats.svelte';
	import {
		clearSelection,
		clearUsedLetters,
		getMoveToIndex,
		guess,
		isValidWord,
		removeLetterFromSelection,
		toggleUpdatePopup
	} from '$lib/logic';
	import { format } from 'date-fns';
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { CipherPuzzle } from '../types';

	const StorageKeys = {
		usedLetters: 'usedLetters',
		moves: 'moves',
		replenishAmt: 'replenishAmt',
		guesses: 'guesses',
		cipher: 'cipher',
		swaps: 'swaps',
		gameStatus: 'gameStatus',
		puzzle: 'puzzle',
		viewed: 'viewed',
		date: 'date'
	};

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

	const alpha = 'qwertyuiopasdfghjklzxcvbnm'.split('');
	const vowels = 'aeiouy'.split('');

	function defaultAlphaState(): Map<string, number> {
		const alphaSet = new Map();
		for (const l of alpha) {
			const lettersInCipher = cipherState.filter((c) => c === l);
			alphaSet.set(l, lettersInCipher.length > 0 ? 3 : vowels.includes(l) ? 2 : 1);
		}
		return alphaSet;
	}

	$: alphaState = defaultAlphaState();

	$: getTierByMoves = () => {
		return tiers[swaps.filter((b) => !b).length + replenishAmt] || tiers[3];
	};

	function toggleModalOpen(val: boolean) {
		modalOpen = val;
	}

	function resetAlphaStateFromSelection(selected: string[], alphaState: Map<string, number>) {
		const newAlphaState = new Map(alphaState);
		selected.forEach((s) => {
			newAlphaState.set(s, (newAlphaState.get(s) as number) + 1);
		});
		return newAlphaState;
	}

	function addBackAmountToAlphaState(letter: string | undefined, alphaState: Map<string, number>) {
		if (!letter) return alphaState;
		const newAlphaState = new Map(alphaState);
		newAlphaState.set(letter, (newAlphaState.get(letter) as number) + 1);

		return newAlphaState;
	}

	function onSelect(letter: string, alphaState: Map<string, number>) {
		if (gameOver) return alphaState;
		if (selected.length >= 12) return alphaState;
		const newAlphaState = new Map(alphaState);

		const currentCount = newAlphaState.get(letter) ?? 0;
		const nextCount = currentCount - 1;

		newAlphaState.set(letter, nextCount);

		const aState = newAlphaState;

		console.log('letters', letter, nextCount);

		selected = [...selected, letter];

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

		return aState;
	}

	// remove all stored data
	function resetStorage() {
		win = false;
		lose = false;
		gameOver = false;
		modalOpen = false;
		const cleared = clearSelection();
		selected = cleared.selected;
		indexToSwap = cleared.indexToSwap;
		startIndex = cleared.startIndex;
		allowChooseIndex = cleared.allowChooseIndex;
		guesses = [];
		moveAmount = 0;
		cipherState = data.cipherWord.split('');
		usedLetters = [];
		replenishAmt = 0;
		swaps = [];
		alphaState = defaultAlphaState();
		localStorage.clear();
	}

	// handle if user has already completed todays game
	function checkTodaysPuzzle() {
		const savedGuesses = localStorage.getItem(StorageKeys.guesses);
		const moves = localStorage.getItem(StorageKeys.moves);
		const puzzle = localStorage.getItem(StorageKeys.puzzle);
		const storedCipher = localStorage.getItem(StorageKeys.cipher);
		const lettersUsed = localStorage.getItem(StorageKeys.usedLetters);
		const correctGuesses = localStorage.getItem(StorageKeys.swaps);
		const replenishAmount = localStorage.getItem(StorageKeys.replenishAmt);
		if (savedGuesses && moves) {
			guesses = JSON.parse(savedGuesses);
			moveAmount = parseInt(moves);
		}
		if (puzzle !== data.word) {
			resetStorage();
			return;
		}
		if (localStorage.getItem(StorageKeys.gameStatus) === 'win') {
			win = true;
			gameOver = true;
			modalOpen = true;
		}
		if (moves) {
			moveAmount = parseInt(moves);
		}
		if (storedCipher) {
			cipherState = storedCipher.split('');
		}
		if (lettersUsed) {
			usedLetters = JSON.parse(lettersUsed);
			alphaState = handleUpdateAlphaMap(alpha, usedLetters, defaultAlphaState());
		}
		if (replenishAmount) {
			replenishAmt = JSON.parse(replenishAmount);
		}
		if (correctGuesses) {
			swaps = JSON.parse(correctGuesses);
		}
	}

	function addTodaysPuzzleToStorage() {
		localStorage.setItem(StorageKeys.puzzle, word);
	}

	function shouldShowTutorial() {
		const hasViewedGame = localStorage.getItem(StorageKeys.viewed);
		if (hasViewedGame) {
			return;
		} else {
			showTutorial = true;
			showUpdatePopup = true;
			localStorage.setItem(StorageKeys.viewed, 'true');
		}
	}

	// check for when user has either won or lost game
	function checkForGameStatus() {
		if (!gameOver && cipherState.join('') === word) {
			win = true;
			gameOver = true;
			modalOpen = true;
			localStorage.setItem(StorageKeys.gameStatus, 'win');
			localStorage.setItem(StorageKeys.moves, String(moveAmount));
			localStorage.setItem(StorageKeys.cipher, word);
			localStorage.setItem(StorageKeys.date, formattedDate);
			return;
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
			const moveIndex = handleGetMoveToIndex();
			indexToSwap = moveIndex;
		}
		if (selected.length === 0) {
			const cleared = clearSelection();
			selected = cleared.selected;
			indexToSwap = cleared.indexToSwap;
			startIndex = cleared.startIndex;
			allowChooseIndex = cleared.allowChooseIndex;
		}
	}

	//  this only happens if there are duplicate letters
	// the user can then click on the letter
	function chooseStartingIndex(index: number) {
		if (cipherState[index] === selected[0]) {
			startIndex = index;
			allowChooseIndex = false;
			const moveIndex = handleGetMoveToIndex();
			indexToSwap = moveIndex;
		}
	}

	function handleGetMoveToIndex() {
		return getMoveToIndex({ selected, startIndex, cipherState });
	}

	function handleUpdateAlphaMap(
		alpha: string[],
		usedLetters: string[],
		defaultState: Map<string, number>
	) {
		const newAlphaState = new Map<string, number>();
		alpha.forEach((l) => {
			const hasUsedLetters = usedLetters.filter((ul) => l === ul).length;
			const currentKey = defaultState.get(l) as number;
			newAlphaState.set(
				l,
				hasUsedLetters > 0
					? currentKey - hasUsedLetters > 0
						? currentKey - hasUsedLetters
						: 0
					: currentKey
			);
		});
		return newAlphaState;
	}

	async function handleGuess() {
		const result = await guess({
			errors,
			swaps,
			selected,
			startIndex,
			isValidWord,
			moveAmount,
			usedLetters,
			cipherState,
			getMoveToIndex: handleGetMoveToIndex,
			guesses,
			word,
			correctPositions
		});
		errors = result.errors;
		swaps = result.swaps;
		selected = result.selected;
		startIndex = result.startIndex;
		indexToSwap = result.indexToSwap;
		guesses = result.guesses;
		correctPositions = result.correctPositions;
		cipherState = result.cipherState;
		moveAmount = result.moveAmount;
		usedLetters = result.usedLetters;
		allowChooseIndex = result.allowChooseIndex;

		// We need to update map of letters based on their usage
		alphaState = handleUpdateAlphaMap(alpha, usedLetters, defaultAlphaState());

		localStorage.setItem(StorageKeys.guesses, JSON.stringify(guesses));
		localStorage.setItem(StorageKeys.moves, JSON.stringify(moveAmount));
		localStorage.setItem(StorageKeys.cipher, cipherState.join(''));
		localStorage.setItem(StorageKeys.usedLetters, JSON.stringify(usedLetters));
		localStorage.setItem(StorageKeys.swaps, JSON.stringify(swaps));
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
		navigator.share({
			text: shareText,
			title: `Cipher #${data.id}`,
			url: 'https://play-cipher.com'
		});
	}

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
		(moveAmount,
			modalOpen,
			showNavModal,
			loading,
			usedLetters,
			showUpdatePopup,
			swaps,
			alphaState,
			date);

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
	<GameOverModal
		{word}
		{shareResults}
		{win}
		{showLetters}
		emoji={getTierByMoves()?.emoji}
		{toggleModalOpen}
	/>
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
		<Stats {replenishAmt} {moveAmount} emoji={getTierByMoves()?.emoji} />
		<!-- Current user selection row -->
		<Selection {selected} />

		<!-- Cipher blocks row -->
		<Cipher
			getMoveToIndex={handleGetMoveToIndex}
			{word}
			{cipherState}
			{allowChooseIndex}
			{selected}
			{startIndex}
			{indexToSwap}
			chooseStartingIndex={(index: number) => {
				if (allowChooseIndex) {
					chooseStartingIndex(index);
				}
			}}
		/>

		<!-- Letter selection box -->
		<Keyboard
			{selected}
			{cipherState}
			handleSelect={(l: string) => {
				alphaState = onSelect(l, alphaState);
			}}
			{alpha}
			{alphaState}
		/>

		<!-- Action buttons -->
		{#if !gameOver}
			<ActionButtons
				clearSelection={() => {
					alphaState = resetAlphaStateFromSelection(selected, alphaState);
					const cleared = clearSelection();
					selected = cleared.selected;
					indexToSwap = cleared.indexToSwap;
					startIndex = cleared.startIndex;
					allowChooseIndex = cleared.allowChooseIndex;
				}}
				clearUsedLetters={() => {
					const clearedLetters = clearUsedLetters({ moveAmount, replenishAmt });
					usedLetters = clearedLetters.usedLetters;
					moveAmount = clearedLetters.moveAmount;
					replenishAmt = clearedLetters.replenishAmt;
					alphaState = defaultAlphaState();
					localStorage.removeItem(StorageKeys.usedLetters);
					localStorage.setItem(StorageKeys.moves, JSON.stringify(moveAmount));
					localStorage.setItem(StorageKeys.replenishAmt, JSON.stringify(replenishAmt));
				}}
				toggleUpdatePopup={() => {
					showUpdatePopup = toggleUpdatePopup(showUpdatePopup);
				}}
				removeLetterFromSelection={() => {
					const { newSelection, removedLetter } = removeLetterFromSelection(selected);
					selected = newSelection;
					alphaState = addBackAmountToAlphaState(removedLetter, alphaState);
				}}
				guess={handleGuess}
				{selected}
				{showUpdatePopup}
				{usedLetters}
			/>
		{/if}
	{/if}
	{#if loading}
		<div class="flex h-[80vh] items-center justify-center gap-2">
			<img src="/logo.svg" alt="logo" height="300" width="300" />
		</div>
	{/if}
</div>
